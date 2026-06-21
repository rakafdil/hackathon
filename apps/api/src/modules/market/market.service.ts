import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CommodityType } from '@prisma/client';
import type { RegionalPriceItem } from '@repo/dto';

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetch regional price data for a commodity.
   * Queries MarketPrice table joined with Region for names.
   */
  async getPrices(commodity: string): Promise<RegionalPriceItem[]> {
    const prices = await this.prisma.marketPrice.findMany({
      where: { commodity: commodity as CommodityType },
      include: { region: true },
      orderBy: { recordedAt: 'desc' },
    });

    return prices.map((p) => ({
      region: p.region.name,
      price: p.price,
      status: p.status,
    }));
  }
}
