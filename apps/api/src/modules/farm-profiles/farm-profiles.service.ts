import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateFarmProfile } from '@repo/dto';

@Injectable()
export class FarmProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFarmProfile) {
    try {
      const farmProfile = await this.prisma.farmProfile.create({
        data: {
          userId,
          farmName: dto.farmName,
          landArea: dto.landArea,
          latitude: dto.latitude,
          longitude: dto.longitude,
          regionId: dto.regionId,
        },
      });

      return farmProfile;
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new NotFoundException(
          `Region with ID "${dto.regionId}" not found. Seed the database first (run: tsx prisma/seed.ts)`,
        );
      }
      throw error;
    }
  }

  async findByUser(userId: string) {
    return this.prisma.farmProfile.findMany({
      where: { userId },
      include: { region: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const profile = await this.prisma.farmProfile.findUnique({
      where: { id },
      include: { region: true, recommendations: true },
    });

    if (!profile || profile.userId !== userId) {
      throw new NotFoundException('Farm profile not found');
    }

    return profile;
  }
}
