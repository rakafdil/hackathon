import { NestFactory } from '@nestjs/core';
import { RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  // ── Swagger / OpenAPI setup ──────────────────────────────────────────────
  // MUST be AFTER setGlobalPrefix so paths include /api prefix.
  // SwaggerModule.setup registers its own internal routes (not affected by global prefix),
  // so the UI will be at /api-docs (not /api/api-docs).
  // `cleanupOpenApiDoc` post-processes the generated OpenAPI spec to properly
  // handle Zod-generated schemas from nestjs-zod's `createZodDto()`.
  const config = new DocumentBuilder()
    .setTitle('Cafescope API')
    .setDescription('Agro-Tech platform backend \u2013 Contract-First, Zod-validated')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const openApiDoc = SwaggerModule.createDocument(app, config);
  cleanupOpenApiDoc(openApiDoc);
  SwaggerModule.setup('api-docs', app, openApiDoc);

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
