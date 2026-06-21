import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FarmProfilesService } from './farm-profiles.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRegion = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Lamongan',
  province: 'Jawa Timur',
};

const mockFarmProfile = {
  id: 'uuid-farm-id',
  userId: 'uuid-user-id',
  farmName: 'Sawah Utama Budi',
  landArea: 2.5,
  latitude: -7.118,
  longitude: 112.416,
  regionId: '11111111-1111-1111-1111-111111111111',
  region: mockRegion,
  recommendations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  farmProfile: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('FarmProfilesService', () => {
  let service: FarmProfilesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset mock implementations to defaults
    mockPrisma.farmProfile.create.mockReset();
    mockPrisma.farmProfile.findMany.mockResolvedValue([mockFarmProfile]);
    mockPrisma.farmProfile.findUnique.mockResolvedValue(mockFarmProfile);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmProfilesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FarmProfilesService>(FarmProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a farm profile and return it', async () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.farmProfile.create.mockResolvedValue(expectedResult);

      const result = await service.create('uuid-user-id', dto);

      expect(mockPrisma.farmProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'uuid-user-id',
          farmName: 'Sawah Utama Budi',
          landArea: 2.5,
          latitude: -7.118,
          longitude: 112.416,
          regionId: 'uuid-region-id',
        },
      });

      expect(result).toEqual(expectedResult);
    });

    it('should allow creating without optional fields', async () => {
      const dto = {
        landArea: 1.0,
        regionId: 'uuid-region-id',
      };

      const expectedResult = {
        id: 'uuid-farm-id',
        userId: 'uuid-user-id',
        farmName: null,
        landArea: 1.0,
        latitude: null,
        longitude: null,
        regionId: 'uuid-region-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.farmProfile.create.mockResolvedValue(expectedResult);

      const result = await service.create('uuid-user-id', dto);

      expect(result.farmName).toBeNull();
      expect(result.landArea).toBe(1.0);
    });
  });

  describe('findByUser()', () => {
    it('should return all farm profiles for a user', async () => {
      mockPrisma.farmProfile.findMany.mockResolvedValue([mockFarmProfile]);

      const result = await service.findByUser('uuid-user-id');

      expect(mockPrisma.farmProfile.findMany).toHaveBeenCalledWith({
        where: { userId: 'uuid-user-id' },
        include: { region: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].farmName).toBe('Sawah Utama Budi');
    });

    it('should return empty array when user has no profiles', async () => {
      mockPrisma.farmProfile.findMany.mockResolvedValue([]);

      const result = await service.findByUser('no-profiles-user');

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a single farm profile', async () => {
      mockPrisma.farmProfile.findUnique.mockResolvedValue(mockFarmProfile);

      const result = await service.findOne('uuid-farm-id', 'uuid-user-id');

      expect(mockPrisma.farmProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-farm-id' },
        include: { region: true, recommendations: true },
      });
      expect(result.farmName).toBe('Sawah Utama Budi');
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockPrisma.farmProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent-id', 'uuid-user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when profile belongs to another user', async () => {
      mockPrisma.farmProfile.findUnique.mockResolvedValue(mockFarmProfile);

      await expect(
        service.findOne('uuid-farm-id', 'different-user-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
