import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiChatService } from './ai-chat.service';
import { PrismaService } from '../prisma/prisma.service';

const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'AI_SERVICE_URL') return undefined; // No AI service in tests
    return undefined;
  }),
};

const mockPrisma = {
  aIChat: {
    create: jest.fn().mockResolvedValue({ id: 'chat-1' }),
  },
};

describe('AiChatService', () => {
  let service: AiChatService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiChatService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AiChatService>(AiChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat()', () => {
    it('should return an answer string', async () => {
      const dto = {
        question: 'Apakah aman menanam padi minggu depan?',
        location: 'Lamongan',
        commodity: 'RICE' as const,
      };

      const result = await service.chat(dto);

      expect(result).toHaveProperty('answer');
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });

    it('should handle optional fields gracefully', async () => {
      const dto = { question: 'Kapan waktu terbaik menanam?' };

      const result = await service.chat(dto);

      expect(result.answer).toBeDefined();
      expect(typeof result.answer).toBe('string');
    });

    it('should use fallback when AI_SERVICE_URL is not configured', async () => {
      const dto = {
        question: 'Test question',
        location: 'Lamongan',
        commodity: 'RICE' as const,
      };

      const result = await service.chat(dto);

      expect(result.answer).toContain('Layanan AI sedang dalam pengembangan');
    });

    it('should save chat to DB when userId is provided', async () => {
      const dto = {
        question: 'Test question',
        location: 'Lamongan',
      };

      await service.chat(dto, 'user-123');

      expect(mockPrisma.aIChat.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          question: 'Test question',
          answer: expect.any(String),
        }),
      });
    });

    it('should not save to DB when userId is not provided', async () => {
      const dto = { question: 'Test question' };

      await service.chat(dto);

      expect(mockPrisma.aIChat.create).not.toHaveBeenCalled();
    });
  });
});
