import { Module } from '@nestjs/common';
import { AgroRiskController } from './agro-risk.controller.js';
import { AgroRiskService } from './agro-risk.service.js';

@Module({
  controllers: [AgroRiskController],
  providers: [AgroRiskService],
  exports: [AgroRiskService],
})
export class AgroRiskModule {}
