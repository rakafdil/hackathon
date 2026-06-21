import { Test, TestingModule } from '@nestjs/testing';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';

const mockAiChatService = {
  chat: jest.fn(),
};

describe('AiChatController', () => {
  let controller: AiChatController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiChatController],
      providers: [{ provide: AiChatService, useValue: mockAiChatService }],
    }).compile();

    controller = module.get<AiChatController>(AiChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat()', () => {
    it('should delegate to the service and wrap in BaseApiResponse', async () => {
      const dto = {
        question: 'Apakah aman menanam padi minggu depan?',
        location: 'Lamongan',
        commodity: 'RICE' as const,
      };
      const serviceResult = {
        answer: 'Disarankan menunda tanam selama 5 hari.',
      };
      mockAiChatService.chat.mockResolvedValue(serviceResult);

      const result = await controller.chat(dto);

      expect(mockAiChatService.chat).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, data: serviceResult });
    });

    it('should work with only the required question field', async () => {
      const dto = { question: 'Kapan waktu terbaik?' };
      const serviceResult = { answer: 'Tergantung lokasi.' };
      mockAiChatService.chat.mockResolvedValue(serviceResult);

      const result = await controller.chat(dto);

      expect(mockAiChatService.chat).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
    });
  });
});
