import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { ZodValidationPipe } from 'src/lib/pipes/zod.pipe';
import {
  AIChatRequestSchema,
  AIChatRequestDto,
  AIChatDataSchema,
  BaseApiResponseSchema,
  type AIChatRequest,
  type AIChatData,
  type BaseApiResponse,
} from '@repo/dto';
import { AiChatService } from './ai-chat.service.js';

// ── Swagger response wrapper ───────────────────────────────────────────────
class AIChatResponseDto extends createZodDto(
  BaseApiResponseSchema(AIChatDataSchema),
) {}

@ApiTags('ai-chat')
@Controller('v1/ai')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Ask the AI agronomist assistant' })
  @ApiBody({
    type: AIChatRequestDto,
    examples: {
      default: {
        summary: 'Flood risk question',
        value: {
          question: 'Apakah risiko banjir di Lamongan untuk padi?',
          location: 'Lamongan',
          commodity: 'RICE',
        },
      },
      simple: {
        summary: 'General question',
        value: {
          question: 'Bagaimana cara meningkatkan hasil panen jagung?',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'AI response generated',
    type: AIChatResponseDto,
  })
  async chat(
    @Body(new ZodValidationPipe(AIChatRequestSchema))
    body: AIChatRequest,
  ): Promise<BaseApiResponse<AIChatData>> {
    const data = await this.aiChatService.chat(body);
    return { success: true, data };
  }
}
