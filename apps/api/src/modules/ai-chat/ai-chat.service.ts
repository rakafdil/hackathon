import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AIChatRequest, AIChatData } from '@repo/dto';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Send a question to the AI agronomist assistant.
   * Calls the Python AI service, falls back to template if unavailable.
   * Saves conversation to DB for history.
   */
  async chat(dto: AIChatRequest, userId?: string): Promise<AIChatData> {
    const aiServiceUrl = this.config.get<string>('AI_SERVICE_URL');
    let answer: string;

    // Try calling the Python AI service
    if (aiServiceUrl) {
      try {
        const response = await fetch(`${aiServiceUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: dto.question,
            location: dto.location,
            commodity: dto.commodity,
          }),
          signal: AbortSignal.timeout(10_000),
        });

        if (response.ok) {
          const data = (await response.json()) as { answer: string };
          answer = data.answer;
        } else {
          throw new Error(`AI service returned ${response.status}`);
        }
      } catch (error: any) {
        this.logger.warn(`AI service unavailable: ${error.message}. Using fallback.`);
        answer = this.fallbackAnswer(dto);
      }
    } else {
      answer = this.fallbackAnswer(dto);
    }

    // Save conversation to DB if we have a userId
    if (userId) {
      try {
        await this.prisma.aIChat.create({
          data: {
            userId,
            question: dto.question,
            answer,
            commodity: dto.commodity ?? undefined,
          },
        });
      } catch (e) {
        this.logger.warn(`Failed to save chat to DB: ${e}`);
      }
    }

    return { answer };
  }

  /**
   * Fallback answer when AI service is unavailable.
   */
  private fallbackAnswer(dto: AIChatRequest): string {
    const loc = dto.location ?? 'wilayah Anda';
    const commodity = dto.commodity ?? 'umum';
    return (
      `[Layanan AI sedang dalam pengembangan] ` +
      `Berdasarkan data tersedia untuk ${loc} (komoditas: ${commodity}): ` +
      `"${dto.question}" — Disarankan memantau kondisi lahan secara berkala dan ` +
      `memeriksa dashboard risiko tanaman untuk informasi lebih lanjut.`
    );
  }
}
