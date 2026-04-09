import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventService } from './event.service';
import { EventEntity } from './event.entity';

const mockEventRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(EventEntity),
          useValue: mockEventRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create and save an event', async () => {
    const dto = { type: 'LoginFailed', entityId: 'user-123' };
    const entity = { id: 'uuid-1', ...dto };

    mockCacheManager.get.mockResolvedValue(null);
    mockCacheManager.set.mockResolvedValue(undefined);
    mockEventRepository.create.mockReturnValue(entity);
    mockEventRepository.save.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(mockEventRepository.create).toHaveBeenCalledWith(dto);
    expect(mockEventRepository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should increment rate limit counter on subsequent events', async () => {
    const dto = { type: 'LoginFailed', entityId: 'user-123' };
    const entity = { id: 'uuid-1', ...dto };

    mockCacheManager.get.mockResolvedValue(5);
    mockCacheManager.set.mockResolvedValue(undefined);
    mockEventRepository.create.mockReturnValue(entity);
    mockEventRepository.save.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(mockCacheManager.set).toHaveBeenCalledWith('rate:user-123', 6, 60000);
    expect(result).toEqual(entity);
  });

  it('should throw 429 when rate limit is exceeded', async () => {
    const dto = { type: 'LoginFailed', entityId: 'user-123' };

    mockCacheManager.get.mockResolvedValue(30);

    await expect(service.create(dto)).rejects.toThrow(
      new HttpException(
        'Rate limit exceeded for entity user-123',
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );

    expect(mockEventRepository.save).not.toHaveBeenCalled();
  });

  it('should return all events ordered by createdAt DESC', async () => {
    const events = [
      { id: 'uuid-1', type: 'LoginFailed', entityId: 'user-123' },
      { id: 'uuid-2', type: 'SuspiciousIp', entityId: 'user-123' },
    ];
    mockEventRepository.find.mockResolvedValue(events);

    const result = await service.findAll();

    expect(mockEventRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(events);
  });

  it('should return events by entityId', async () => {
    const events = [
      { id: 'uuid-1', type: 'LoginFailed', entityId: 'user-123' },
    ];
    mockEventRepository.find.mockResolvedValue(events);

    const result = await service.findByEntityId('user-123');

    expect(mockEventRepository.find).toHaveBeenCalledWith({
      where: { entityId: 'user-123' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(events);
  });
});
