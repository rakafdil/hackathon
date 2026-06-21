import { Module } from '@nestjs/common';
import { FarmProfilesController } from './farm-profiles.controller.js';
import { FarmProfilesService } from './farm-profiles.service.js';

@Module({
  controllers: [FarmProfilesController],
  providers: [FarmProfilesService],
})
export class FarmProfilesModule {}
