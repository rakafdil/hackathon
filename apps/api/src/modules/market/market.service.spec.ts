import { Test, TestingModule } from '@nestjs/testing';
import { MarketService } from './market.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRegion = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Lamongan',
  province: 'Jawa Timur',
};

const mockPrices = [
  {
    id: 'price-1',
    regionId: mockRegion.id,
    commodity: 'RICE',
    price: 12500,
    status: 'NORMAL',
    recordedAt: new Date(),
    region: mockRegion,
  },
  {
    id: 'price-3',
    regionId: '33333333-3333-3333-3333-333333333333',
    commodity: 'RICE',
    price: 18000,
    status: 'ANOMALY',
    recordedAt: new Date(),
    region: { ...mockRegion, id: '33333333-3333-3333-3333-333333333333', name: 'Surabaya' },
  },
];

const mockPrisma = {
  marketPrice: {
    findMany: jest.fn().mockResolvedValue(mockPrices),
  },
};

describe('MarketService', () => {
  let service: MarketService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset mock implementations to defaults
    mockPrisma.marketPrice.findMany.mockResolvedValue(mockPrices);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MarketService>(MarketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPrices()', () => {
    it('should return an array of regional price items', async () => {
      const result = await service.getPrices('RICE');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          region: expect.any(String),
          price: expect.any(Number),
          status: expect.any(String),
        }),
      );
    });

    it('should map region names correctly', async () => {
      const result = await service.getPrices('RICE');

      expect(result[0].region).toBe('Lamongan');
      expect(result[1].region).toBe('Surabaya');
    });

    it('should return positive prices', async () => {
      const result = await service.getPrices('RICE');

      for (const item of result) {
        expect(item.price).toBeGreaterThan(0);
      }
    });

    it('should return empty array when no prices found', async () => {
      mockPrisma.marketPrice.findMany.mockResolvedValue([]);

      const result = await service.getPrices('SOYBEAN');

      expect(result).toEqual([]);
    });

    it('should call prisma with correct commodity filter', async () => {
      await service.getPrices('CORN');

      expect(mockPrisma.marketPrice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { commodity: 'CORN' },
        }),
      );
    });
  });
});
