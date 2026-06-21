import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  RecommendationRequest,
  RecommendationData,
  DashboardData,
} from '@repo/dto';

@Injectable()
export class AgroRiskService {
  private readonly logger = new Logger(AgroRiskService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /**
   * Generate a smart planting recommendation.
   * 1. Query DB for region + crop risk data
   * 2. Call Python AI service /recommend for enhanced analysis
   * 3. Merge results (Python takes priority for NDVI/weather)
   * 4. Fallback to DB-only if Python service is unreachable
   */
  async getRecommendation(dto: RecommendationRequest): Promise<RecommendationData> {
    // 1. Find the region by name
    const region = await this.prisma.region.findFirst({
      where: { name: { equals: dto.location, mode: 'insensitive' } },
    });

    if (!region) {
      throw new NotFoundException(
        `Region "${dto.location}" not found. Available: Lamongan, Bojonegoro, Surabaya`,
      );
    }

    // 2. Get latest crop risk for this region
    const risk = await this.prisma.cropRisk.findFirst({
      where: { regionId: region.id },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Try calling Python AI service for enhanced recommendation
    const aiServiceUrl = this.config.get<string>('AI_SERVICE_URL');
    if (aiServiceUrl) {
      try {
        const response = await fetch(`${aiServiceUrl}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: region.latitude,
            longitude: region.longitude,
            commodity: dto.commodity,
            planting_date: dto.plantingDate,
          }),
          signal: AbortSignal.timeout(10_000),
        });

        if (response.ok) {
          const aiData = (await response.json()) as {
            recommendation: string;
            suitability_score: number;
            flood_risk: string;
            drought_risk: string;
            estimated_yield: number;
          };

          return {
            recommendation: aiData.recommendation as RecommendationData['recommendation'],
            suitabilityScore: aiData.suitability_score,
            floodRisk: aiData.flood_risk as RecommendationData['floodRisk'],
            droughtRisk: aiData.drought_risk as RecommendationData['droughtRisk'],
            estimatedYield: aiData.estimated_yield,
          };
        }
        throw new Error(`AI service returned ${response.status}`);
      } catch (error: any) {
        this.logger.warn(
          `AI service unavailable: ${error.message}. Falling back to DB-only analysis.`,
        );
      }
    }

    // 4. Fallback: compute from DB data using simple agronomy rules
    const floodRisk = risk?.floodRisk ?? 'MEDIUM';
    const droughtRisk = risk?.droughtRisk ?? 'MEDIUM';
    const ndvi = risk?.ndviScore ?? 0.5;

    const shouldDelay = floodRisk === 'HIGH' || droughtRisk === 'HIGH';
    const recommendation = shouldDelay ? 'DELAY' : 'PLANT_NOW';

    const riskPenalty =
      (floodRisk === 'HIGH' ? 20 : floodRisk === 'MEDIUM' ? 10 : 0) +
      (droughtRisk === 'HIGH' ? 20 : droughtRisk === 'MEDIUM' ? 10 : 0);
    const suitabilityScore = Math.round(Math.min(100, Math.max(0, ndvi * 100 - riskPenalty + 20)));
    const estimatedYield = Math.round((suitabilityScore / 100) * 7.5 * 10) / 10;

    return {
      recommendation,
      suitabilityScore,
      floodRisk,
      droughtRisk,
      estimatedYield,
    };
  }

  /**
   * Fetch crop risk dashboard data for a given location.
   * Returns real NDVI, temperature, rainfall from the database.
   */
  async getDashboard(location: string): Promise<DashboardData> {
    const region = await this.prisma.region.findFirst({
      where: { name: { equals: location, mode: 'insensitive' } },
    });

    if (!region) {
      throw new NotFoundException(
        `Region "${location}" not found. Available: Lamongan, Bojonegoro, Surabaya`,
      );
    }

    const risk = await this.prisma.cropRisk.findFirst({
      where: { regionId: region.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!risk) {
      throw new NotFoundException(
        `No crop risk data available for region "${location}"`,
      );
    }

    return {
      ndviScore: risk.ndviScore,
      temperature: risk.temperature,
      rainfall: risk.rainfall,
      floodRisk: risk.floodRisk,
      droughtRisk: risk.droughtRisk,
    };
  }
}
