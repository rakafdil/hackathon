import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { CommodityType } from '@prisma/client';
import { ZodValidationPipe } from 'src/lib/pipes/zod.pipe';
import {
  PriceQuerySchema,
  RegionalPriceItemSchema,
  BaseApiResponseSchema,
  type PriceQuery,
  type RegionalPriceItem,
  type BaseApiResponse,
} from '@repo/dto';
import { MarketService } from './market.service.js';

// ── Swagger response wrapper ───────────────────────────────────────────────
class PriceListResponseDto extends createZodDto(
  BaseApiResponseSchema(RegionalPriceItemSchema.array()),
) {}

@ApiTags('market')
@Controller('v1/market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('prices')
  @ApiOperation({ summary: 'Get regional price intelligence for a commodity' })
  @ApiQuery({
    name: 'commodity',
    enum: CommodityType,
    example: 'RICE',
    description: 'Commodity to query prices for',
  })
  @ApiOkResponse({
    description: 'Price data retrieved',
    type: PriceListResponseDto,
  })
  async getPrices(
    @Query(new ZodValidationPipe(PriceQuerySchema))
    query: PriceQuery,
  ): Promise<BaseApiResponse<RegionalPriceItem[]>> {
    const data = await this.marketService.getPrices(query.commodity);
    return { success: true, data };
  }
}
