import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { ZodValidationPipe } from 'src/lib/pipes/zod.pipe';
import {
  RecommendationRequestSchema,
  RecommendationRequestDto,
  RecommendationDataSchema,
  DashboardQuerySchema,
  DashboardQueryDto,
  DashboardDataSchema,
  BaseApiResponseSchema,
  type RecommendationRequest,
  type RecommendationData,
  type DashboardQuery,
  type DashboardData,
  type BaseApiResponse,
} from '@repo/dto';
import { AgroRiskService } from './agro-risk.service.js';

// ── Swagger response wrappers ──────────────────────────────────────────────
class RecommendationResponseDto extends createZodDto(
  BaseApiResponseSchema(RecommendationDataSchema),
) {}
class DashboardResponseDto extends createZodDto(
  BaseApiResponseSchema(DashboardDataSchema),
) {}

@ApiTags('agro-risk')
@Controller('v1/agro-risk')
export class AgroRiskController {
  constructor(private readonly agroRiskService: AgroRiskService) {}

  @Post('recommendation')
  @ApiOperation({ summary: 'Get planting recommendation' })
  @ApiBody({
    type: RecommendationRequestDto,
    examples: {
      default: {
        summary: 'Rice in Lamongan',
        value: {
          location: 'Lamongan',
          commodity: 'RICE',
          plantingDate: '2026-07-12',
        },
      },
      corn: {
        summary: 'Corn in Bojonegoro',
        value: {
          location: 'Bojonegoro',
          commodity: 'CORN',
          plantingDate: '2026-08-01',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Recommendation returned',
    type: RecommendationResponseDto,
  })
  async getRecommendation(
    @Body(new ZodValidationPipe(RecommendationRequestSchema))
    body: RecommendationRequest,
  ): Promise<BaseApiResponse<RecommendationData>> {
    const data = await this.agroRiskService.getRecommendation(body);
    return { success: true, data };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get crop risk dashboard' })
  @ApiQuery({ name: 'location', example: 'Lamongan', description: 'City or region name' })
  @ApiOkResponse({
    description: 'Dashboard data',
    type: DashboardResponseDto,
  })
  async getDashboard(
    @Query(new ZodValidationPipe(DashboardQuerySchema))
    query: DashboardQuery,
  ): Promise<BaseApiResponse<DashboardData>> {
    const data = await this.agroRiskService.getDashboard(query.location);
    return { success: true, data };
  }
}
