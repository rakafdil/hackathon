import {
  Res,
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import { GoogleGuard } from './guard/google.guard.js';
import { type Response } from 'express';

/** Cookie options reused across auth endpoints */
const COOKIE_NAME = 'cookie_token';
const COOKIE_SAME_SITE = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: COOKIE_SAME_SITE as 'none' | 'lax',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 1 day (ms)
};

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user with email + password.
   * The global `ZodValidationPipe` (from nestjs-zod) validates `RegisterDto`
   * automatically — no inline `@UsePipes()` needed.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Register with email',
        value: {
          email: 'budi@example.com',
          password: 'password123',
          fullName: 'Budi Santoso',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 403, description: 'Email already in use' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenData = await this.authService.register(dto);
    res.cookie(COOKIE_NAME, tokenData.access_token, COOKIE_OPTIONS);
    return tokenData;
  }

  /**
   * Login with email + password. Returns a JWT and sets an httpOnly cookie.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Login example',
        value: {
          email: 'budi@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT' })
  @ApiResponse({ status: 403, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenData = await this.authService.login(dto);
    res.cookie(COOKIE_NAME, tokenData.access_token, COOKIE_OPTIONS);
    return tokenData;
  }

  /**
   * Logout – clears the auth cookie.
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: COOKIE_SAME_SITE as 'none' | 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }

  /**
   * Initiate Google OAuth2 login (redirects to Google).
   */
  @Get('google')
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: 'Login with Google OAuth2' })
  googleAuth() {
    // GoogleGuard handles the redirect to Google's login page.
  }

  /**
   * Google OAuth2 callback – sets auth cookie and redirects to frontend.
   */
  @Get('google/callback')
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: 'Google OAuth2 callback URL' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const tokenData = await this.authService.googleLogin(req);
    const token = tokenData.access_token;

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
