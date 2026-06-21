import { Test, TestingModule } from '@nestjs/testing';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

const mockMarketService = {
  getPrices: jest.fn(),
};

describe('MarketController', () => {
  let controller: MarketController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketController],
      providers: [{ provide: MarketService, useValue: mockMarketService }],
    }).compile();

    controller = module.get<MarketController>(MarketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPrices()', () => {
    it('should delegate to the service and wrap in BaseApiResponse', async () => {
      const serviceResult = [
        { region: 'Lamongan', price: 6200, status: 'NORMAL' },
        { region: 'Surabaya', price: 7100, status: 'ANOMALY' },
      ];
      mockMarketService.getPrices.mockResolvedValue(serviceResult);

      const query = { commodity: 'RICE' as const };
      const result = await controller.getPrices(query);

      expect(mockMarketService.getPrices).toHaveBeenCalledWith('RICE');
      expect(result).toEqual({ success: true, data: serviceResult });
    });
  });
});
