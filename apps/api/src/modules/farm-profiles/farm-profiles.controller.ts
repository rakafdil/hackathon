import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { ZodValidationPipe } from 'src/lib/pipes/zod.pipe';
import { CreateFarmProfileSchema, CreateFarmProfileDto } from '@repo/dto';
import { FarmProfilesService } from './farm-profiles.service.js';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { GetUser } from '../auth/decorator/get-user.decorator.js';

@ApiTags('farm-profiles')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('v1/farm-profiles')
export class FarmProfilesController {
  constructor(private readonly farmProfilesService: FarmProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a farm profile' })
  @ApiBody({
    type: CreateFarmProfileDto,
    examples: {
      default: {
        summary: 'Lamongan rice farm',
        value: {
          farmName: 'Tani Makmur',
          landArea: 2.5,
          latitude: -6.9839,
          longitude: 112.0,
          regionId: '11111111-1111-1111-1111-111111111111',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Farm profile created' })
  create(
    @GetUser('id') userId: string,
    @Body(new ZodValidationPipe(CreateFarmProfileSchema)) body: CreateFarmProfileDto,
  ) {
    return this.farmProfilesService.create(userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List my farm profiles' })
  @ApiResponse({ status: 200, description: 'Returns all farm profiles for the current user' })
  findAll(@GetUser('id') userId: string) {
    return this.farmProfilesService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single farm profile' })
  @ApiParam({ name: 'id', description: 'Farm profile UUID' })
  @ApiResponse({ status: 200, description: 'Returns the farm profile with region and recommendations' })
  findOne(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.farmProfilesService.findOne(id, userId);
  }
}
