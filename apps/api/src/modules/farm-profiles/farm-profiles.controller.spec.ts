import { Test, TestingModule } from '@nestjs/testing';
import { FarmProfilesController } from './farm-profiles.controller';
import { FarmProfilesService } from './farm-profiles.service';

const mockFarmProfilesService = {
  create: jest.fn(),
};

describe('FarmProfilesController', () => {
  let controller: FarmProfilesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmProfilesController],
      providers: [{ provide: FarmProfilesService, useValue: mockFarmProfilesService }],
    }).compile();

    controller = module.get<FarmProfilesController>(FarmProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should delegate to the service with userId and DTO', async () => {
      const dto = {
        farmName: 'Sawah Utama Budi',
        landArea: 2.5,
        latitude: -7.118,
        longitude: 112.416,
        regionId: 'uuid-region-id',
      };

      const expectedResult = {
        id: 'uuid-farm-id',
        userId: 'uuid-user-id',
        ...dto,
      };

      mockFarmProfilesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create('uuid-user-id', dto);

      expect(mockFarmProfilesService.create).toHaveBeenCalledWith('uuid-user-id', dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
