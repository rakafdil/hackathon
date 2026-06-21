/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  USERS CONTROLLER – UNIT TEST BLUEPRINT (Gold Standard)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  PATTERNS DEMONSTRATED:
 *  ┌──────────────────────────────────┬──────────────────────────────────────┐
 *  │ Pattern                          │ Where                                │
 *  ├──────────────────────────────────┼──────────────────────────────────────┤
 *  │ Service mock via `useValue`      │ `{ provide: UsersService, useValue }│
 *  │ Custom decorator simulation      │ Pass userId directly (skip guard)    │
 *  │ Return-value assertions          │ Verify controller returns svc result │
 *  │ Error propagation                │ Service errors bubble up to controller│
 *  └──────────────────────────────────┴──────────────────────────────────────┘
 *
 *  NOTE: @GetUser('id') decorator extracts the user ID from the JWT payload.
 *  In unit tests we pass it directly as a string – no JWT machinery needed.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  getMe: jest.fn(),
  editUser: jest.fn(),
  createUser: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe()', () => {
    it('should delegate to usersService.getMe with the userId from the JWT', async () => {
      const expectedUser = {
        id: 'uuid-789',
        email: 'charlie@example.com',
        fullName: 'Charlie Chaplin',
        role: 'FARMER',
      };
      mockUsersService.getMe.mockResolvedValue(expectedUser);

      // The @GetUser('id') decorator extracts the user ID from the JWT payload.
      // In unit tests we pass it directly as a string argument.
      const result = await controller.getMe('uuid-789');

      expect(mockUsersService.getMe).toHaveBeenCalledWith('uuid-789');
      expect(mockUsersService.getMe).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should propagate NotFoundException from the service', async () => {
      mockUsersService.getMe.mockRejectedValue(new Error('User not found'));

      await expect(controller.getMe('bad-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('editUser()', () => {
    it('should delegate to usersService.editUser with userId and DTO', async () => {
      const updatedUser = {
        id: 'uuid-789',
        email: 'newemail@example.com',
        fullName: 'Charlie Chaplin',
        role: 'FARMER',
      };
      mockUsersService.editUser.mockResolvedValue(updatedUser);

      const dto = { email: 'newemail@example.com' };
      const result = await controller.editUser('uuid-789', dto);

      expect(mockUsersService.editUser).toHaveBeenCalledWith('uuid-789', dto);
      expect(mockUsersService.editUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
    });

    it('should allow updating only the name field', async () => {
      const updatedUser = {
        id: 'uuid-789',
        email: 'charlie@example.com',
        fullName: 'New Name',
        role: 'FARMER',
      };
      mockUsersService.editUser.mockResolvedValue(updatedUser);

      const dto = { name: 'New Name' };
      const result = await controller.editUser('uuid-789', dto);

      expect(mockUsersService.editUser).toHaveBeenCalledWith('uuid-789', dto);
      expect(result.fullName).toBe('New Name');
    });
  });

  describe('createUser()', () => {
    it('should delegate to usersService.createUser with the DTO', async () => {
      const createdUser = {
        id: 'uuid-new',
        fullName: 'Budi Santoso',
        email: 'budi@mail.com',
        role: 'FARMER',
      };
      mockUsersService.createUser.mockResolvedValue(createdUser);

      const dto = {
        fullName: 'Budi Santoso',
        email: 'budi@mail.com',
        password: 'password123',
        role: 'FARMER' as const,
      };
      const result = await controller.createUser(dto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });
  });
});
