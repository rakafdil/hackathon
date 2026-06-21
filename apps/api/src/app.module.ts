import { Module } from '@nestjs/common';
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AgroRiskModule } from './modules/agro-risk/agro-risk.module.js';
import { MarketModule } from './modules/market/market.module.js';
import { AiChatModule } from './modules/ai-chat/ai-chat.module.js';
import { FarmProfilesModule } from './modules/farm-profiles/farm-profiles.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AgroRiskModule,
    MarketModule,
    AiChatModule,
    FarmProfilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ── nestjs-zod: Global validation pipe ──────────────────────────────────
    // Automatically validates @Body(), @Query(), @Param() when the type
    // is a DTO created via `createZodDto()`. Replaces class-validator.
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    // ── nestjs-zod: Global serializer interceptor ──────────────────────────
    // Automatically serializes/validates response bodies when
    // @ZodSerializerDto() is applied to a controller method.
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
