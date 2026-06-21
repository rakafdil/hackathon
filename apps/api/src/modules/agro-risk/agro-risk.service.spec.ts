import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { AgroRiskService } from './agro-risk.service';
import { PrismaService } from '../prisma/prisma.service';

// -- Mock data --
const mockRegion = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Lamongan',
  province: 'Jawa Timur',
  latitude: -6.9839,
  longitude: 112.4168,
};

const mockCropRisk = {
  id: 'crop-risk-1',
  regionId: mockRegion.id,
  ndviScore: 0.72,
  temperature: 29.5,
  rainfall: 180.0,
  floodRisk: 'MEDIUM',
  droughtRisk: 'LOW',
  createdAt: new Date(),
};

// -- Mock Prisma --
const mockPrisma = {
  region: {
    findFirst: jest.fn().mockResolvedValue(mockRegion),
  },
  cropRisk: {
    findFirst: jest.fn().mockResolvedValue(mockCropRisk),
  },
};

// -- Mock Config --
const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'AI_SERVICE_URL') return undefined; // No AI service in tests
    return undefined;
  }),
};

describe('AgroRiskService', () => {
  let service: AgroRiskService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset mock implementations to defaults (clearAllMocks only clears call history)
    mockPrisma.region.findFirst.mockResolvedValue(mockRegion);
    mockPrisma.cropRisk.findFirst.mockResolvedValue(mockCropRisk);
    mockConfig.get.mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgroRiskService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AgroRiskService>(AgroRiskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecommendation()', () => {
    it('should return a recommendation with the correct shape', async () => {
      const dto = {
        location: 'Lamongan',
        commodity: 'RICE' as const,
        plantingDate: '2026-07-12',
      };

      const result = await service.getRecommendation(dto);

      expect(result).toEqual(
        expect.objectContaining({
          recommendation: expect.any(String),
          suitabilityScore: expect.any(Number),
          floodRisk: expect.any(String),
          droughtRisk: expect.any(String),
          estimatedYield: expect.any(Number),
        }),
      );
    });

    it('should return PLANT_NOW when risks are not HIGH', async () => {
      mockPrisma.cropRisk.findFirst.mockResolvedValue({
        ...mockCropRisk,
        floodRisk: 'LOW',
        droughtRisk: 'LOW',
      });

      const result = await service.getRecommendation({
        location: 'Lamongan',
        commodity: 'RICE' as const,
        plantingDate: '2026-07-12',
      });

      expect(result.recommendation).toBe('PLANT_NOW');
    });

    it('should return DELAY when flood risk is HIGH', async () => {
      mockPrisma.cropRisk.findFirst.mockResolvedValue({
        ...mockCropRisk,
        floodRisk: 'HIGH',
        droughtRisk: 'LOW',
      });

      const result = await service.getRecommendation({
        location: 'Lamongan',
        commodity: 'RICE' as const,
        plantingDate: '2026-07-12',
      });

      expect(result.recommendation).toBe('DELAY');
    });

    it('should return a suitabilityScore between 0 and 100', async () => {
      const result = await service.getRecommendation({
        location: 'Lamongan',
        commodity: 'CORN' as const,
        plantingDate: '2026-08-01',
      });

      expect(result.suitabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.suitabilityScore).toBeLessThanOrEqual(100);
    });

    it('should throw NotFoundException for unknown region', async () => {
      mockPrisma.region.findFirst.mockResolvedValue(null);

      await expect(
        service.getRecommendation({
          location: 'Unknown City',
          commodity: 'RICE' as const,
          plantingDate: '2026-07-12',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use fallback defaults when no crop risk data exists', async () => {
      mockPrisma.cropRisk.findFirst.mockResolvedValue(null);

      const result = await service.getRecommendation({
        location: 'Lamongan',
        commodity: 'RICE' as const,
        plantingDate: '2026-07-12',
      });

      expect(result.recommendation).toBe('PLANT_NOW');
      expect(result.floodRisk).toBe('MEDIUM');
      expect(result.droughtRisk).toBe('MEDIUM');
    });
  });

  describe('getDashboard()', () => {
    it('should return dashboard data for a given location', async () => {
      const result = await service.getDashboard('Lamongan');

      expect(result).toEqual(
        expect.objectContaining({
          ndviScore: expect.any(Number),
          temperature: expect.any(Number),
          rainfall: expect.any(Number),
          floodRisk: expect.any(String),
          droughtRisk: expect.any(String),
        }),
      );
    });

    it('should return ndviScore between 0 and 1', async () => {
      const result = await service.getDashboard('Lamongan');

      expect(result.ndviScore).toBeGreaterThanOrEqual(0);
      expect(result.ndviScore).toBeLessThanOrEqual(1);
    });

    it('should throw NotFoundException for unknown region', async () => {
      mockPrisma.region.findFirst.mockResolvedValue(null);

      await expect(service.getDashboard('UnknownCity')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when no crop risk data', async () => {
      mockPrisma.cropRisk.findFirst.mockResolvedValue(null);

      await expect(service.getDashboard('Lamongan')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
