/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  USERS SERVICE – UNIT TEST BLUEPRINT (Gold Standard)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  PATTERNS DEMONSTRATED:
 *  ┌────────────────────────────────┬────────────────────────────────────────┐
 *  │ Pattern                        │ Where                                  │
 *  ├────────────────────────────────┼────────────────────────────────────────┤
 *  │ Partial Prisma mock            │ `mockPrisma.user.findUnique/update`   │
 *  │ Sensitive field stripping      │ `expect(r).not.toHaveProperty(...)`   │
 *  │ Exception assertions           │ `rejects.toThrow(NotFoundException)`  │
 *  │ Data factory with overrides    │ `makePrismaUser({ email: '...' })`    │
 *  └────────────────────────────────┴────────────────────────────────────────┘
 *
 *  KEY INSIGHT: The service strips `passwordHash` from ALL responses.
 *  We assert this in every test — it's a security contract.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock argon2 for fast tests (createUser hashes passwords)
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('$argon2id$hashed'),
  verify: jest.fn(),
}));

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};

const makePrismaUser = (overrides = {}) => ({
  id: 'uuid-456',
  email: 'bob@example.com',
  fullName: 'Bob Builder',
  passwordHash: '$argon2id$super_secret_hash',
  role: 'FARMER',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-06-01'),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMe()', () => {
    it('should return the user WITHOUT the passwordHash field', async () => {
      const user = makePrismaUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getMe('uuid-456');

      // Assert – correct user was fetched.
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-456' },
      });

      // Assert – sensitive field is stripped from the response.
      expect(result).not.toHaveProperty('passwordHash');

      // Assert – all other fields are present.
      expect(result).toEqual(
        expect.objectContaining({
          id: 'uuid-456',
          email: 'bob@example.com',
          fullName: 'Bob Builder',
          role: 'FARMER',
        }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getMe('nonexistent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('editUser()', () => {
    it('should update user fields and return the user WITHOUT passwordHash', async () => {
      const updatedUser = makePrismaUser({ email: 'newemail@example.com' });
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const dto = { email: 'newemail@example.com' };
      const result = await service.editUser('uuid-456', dto);

      // Assert – prisma.update was called with the correct data.
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-456' },
        data: { email: 'newemail@example.com' },
      });

      // Assert – sensitive field is stripped.
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('newemail@example.com');
    });

    it('should allow partial updates (only fullName)', async () => {
      const updatedUser = makePrismaUser({ fullName: 'New Name' });
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const dto = { name: 'New Name' };
      const result = await service.editUser('uuid-456', dto);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-456' },
        data: { name: 'New Name' },
      });

      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('createUser()', () => {
    it('should hash password, create user, and return without passwordHash', async () => {
      const newUser = makePrismaUser({
        email: 'budi@mail.com',
        fullName: 'Budi Santoso',
        role: 'FARMER',
      });
      mockPrisma.user.create.mockResolvedValue(newUser);

      const dto = {
        fullName: 'Budi Santoso',
        email: 'budi@mail.com',
        password: 'password123',
        role: 'FARMER' as const,
      };
      const result = await service.createUser(dto);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'budi@mail.com',
          fullName: 'Budi Santoso',
          passwordHash: '$argon2id$hashed',
          role: 'FARMER',
        },
      });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('budi@mail.com');
    });

    it('should default role to FARMER when not specified', async () => {
      const newUser = makePrismaUser({ role: 'FARMER' });
      mockPrisma.user.create.mockResolvedValue(newUser);

      const dto = {
        fullName: 'Test User',
        email: 'test@mail.com',
        password: 'password123',
      };
      await service.createUser(dto);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'FARMER' }),
        }),
      );
    });

    it('should throw ForbiddenException when email is already taken', async () => {
      const prismaError = { code: 'P2002', meta: { target: ['email'] } };
      mockPrisma.user.create.mockRejectedValue(prismaError);

      const dto = {
        fullName: 'Test',
        email: 'taken@mail.com',
        password: 'password123',
      };
      await expect(service.createUser(dto)).rejects.toThrow(ForbiddenException);
    });
  });
});
