import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { UsersService } from './users.service.js';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { GetUser } from '../auth/decorator/get-user.decorator.js';
import { EditUserDto } from './dto/edit-user.dto.js';
import { CreateUserSchema } from '@repo/dto';

/** Swagger-ready DTO for POST /v1/users */
class CreateUserDto extends createZodDto(CreateUserSchema) {}

@ApiTags('users')
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user (public endpoint for admin/testing).
   * In production, guard this with a RolesGuard or move to auth module.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      farmer: {
        summary: 'Create a farmer',
        value: {
          fullName: 'Budi Santoso',
          email: 'budi@example.com',
          password: 'password123',
          role: 'FARMER',
        },
      },
      buyer: {
        summary: 'Create a buyer',
        value: {
          fullName: 'Siti Aminah',
          email: 'siti@example.com',
          password: 'password123',
          role: 'BUYER',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Email already in use' })
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@GetUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  /**
   * Update the current user's profile.
   * The global `ZodValidationPipe` validates `EditUserDto` automatically.
   */
  @Patch()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: EditUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  editUser(
    @GetUser('id') userId: string,
    @Body() dto: EditUserDto,
  ) {
    return this.usersService.editUser(userId, dto);
  }
}
