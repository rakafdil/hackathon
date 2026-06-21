import { Test, TestingModule } from '@nestjs/testing';
import { AgroRiskController } from './agro-risk.controller';
import { AgroRiskService } from './agro-risk.service';

const mockAgroRiskService = {
  getRecommendation: jest.fn(),
  getDashboard: jest.fn(),
};

describe('AgroRiskController', () => {
  let controller: AgroRiskController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgroRiskController],
      providers: [{ provide: AgroRiskService, useValue: mockAgroRiskService }],
    }).compile();

    controller = module.get<AgroRiskController>(AgroRiskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  POST /api/v1/agro-risk/recommendation
  // ════════════════════════════════════════════════════════════════════════════
  describe('getRecommendation()', () => {
    it('should delegate to the service and wrap in BaseApiResponse', async () => {
      const dto = {
        location: 'Lamongan',
        commodity: 'RICE' as const,
        plantingDate: '2026-07-12',
      };
      const serviceResult = {
        recommendation: 'DELAY',
        suitabilityScore: 82,
        floodRisk: 'MEDIUM',
        droughtRisk: 'LOW',
        estimatedYield: 5.2,
      };
      mockAgroRiskService.getRecommendation.mockResolvedValue(serviceResult);

      const result = await controller.getRecommendation(dto);

      expect(mockAgroRiskService.getRecommendation).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, data: serviceResult });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  GET /api/v1/agro-risk/dashboard
  // ════════════════════════════════════════════════════════════════════════════
  describe('getDashboard()', () => {
    it('should delegate to the service with query.location', async () => {
      const serviceResult = {
        ndviScore: 0.78,
        temperature: 31,
        rainfall: 120,
        floodRisk: 'LOW',
        droughtRisk: 'MEDIUM',
      };
      mockAgroRiskService.getDashboard.mockResolvedValue(serviceResult);

      const query = { location: 'Lamongan' };
      const result = await controller.getDashboard(query);

      expect(mockAgroRiskService.getDashboard).toHaveBeenCalledWith('Lamongan');
      expect(result).toEqual({ success: true, data: serviceResult });
    });
  });
});
