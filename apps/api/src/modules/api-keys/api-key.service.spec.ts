import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from './api-key.entity';

const mockApiKeyRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeyRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create an api key and return the raw key', async () => {
    const dto = { clientId: 'client-123' };
    const saved = { id: 'uuid-1', key: 'hashed', clientId: 'client-123', active: true };

    mockApiKeyRepository.create.mockReturnValue(saved);
    mockApiKeyRepository.save.mockResolvedValue(saved);

    const result = await service.create(dto);

    expect(mockApiKeyRepository.create).toHaveBeenCalled();
    expect(mockApiKeyRepository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id', 'uuid-1');
    expect(result).toHaveProperty('clientId', 'client-123');
    expect(result).toHaveProperty('key');
    expect(typeof result.key).toBe('string');
    expect(result.key).toHaveLength(64);
  });

  it('should return null when validating an invalid key', async () => {
    mockApiKeyRepository.findOne.mockResolvedValue(null);

    const result = await service.validate('invalid-key');

    expect(result).toBeNull();
  });

  it('should return the api key when validating a valid key', async () => {
    const apiKey = { id: 'uuid-1', clientId: 'client-123', active: true };
    mockApiKeyRepository.findOne.mockResolvedValue(apiKey);

    const result = await service.validate('valid-raw-key');

    expect(result).toEqual(apiKey);
  });

  it('should revoke an existing api key', async () => {
    const apiKey = { id: 'uuid-1', clientId: 'client-123', active: true };
    mockApiKeyRepository.findOne.mockResolvedValue(apiKey);
    mockApiKeyRepository.save.mockResolvedValue({ ...apiKey, active: false });

    await service.revoke('uuid-1');

    expect(mockApiKeyRepository.save).toHaveBeenCalledWith({ ...apiKey, active: false });
  });

  it('should throw NotFoundException when revoking a non-existent key', async () => {
    mockApiKeyRepository.findOne.mockResolvedValue(null);

    await expect(service.revoke('non-existent-id')).rejects.toThrow(NotFoundException);
  });
});
