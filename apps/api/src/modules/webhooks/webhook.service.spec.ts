import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebhookService } from './webhook.service';
import { Webhook } from './webhook.entity';

const mockWebhookRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: getRepositoryToken(Webhook),
          useValue: mockWebhookRepository,
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should register a webhook', async () => {
    const dto = { url: 'https://example.com/hook', clientId: 'client-123' };
    const webhook = { id: 'uuid-1', ...dto, active: true };

    mockWebhookRepository.create.mockReturnValue(webhook);
    mockWebhookRepository.save.mockResolvedValue(webhook);

    const result = await service.register(dto);

    expect(mockWebhookRepository.create).toHaveBeenCalledWith(dto);
    expect(mockWebhookRepository.save).toHaveBeenCalledWith(webhook);
    expect(result).toEqual(webhook);
  });

  it('should return all webhooks ordered by createdAt DESC', async () => {
    const webhooks = [
      { id: 'uuid-1', url: 'https://example.com/hook', clientId: 'client-123', active: true },
    ];
    mockWebhookRepository.find.mockResolvedValue(webhooks);

    const result = await service.findAll();

    expect(mockWebhookRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(webhooks);
  });

  it('should deliver payload to all active webhooks', async () => {
    const webhooks = [
      { id: 'uuid-1', url: 'https://example.com/hook', clientId: 'client-123', active: true, secret: null },
    ];
    mockWebhookRepository.find.mockResolvedValue(webhooks);

    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    const payload = {
      event: 'entity.blocked',
      entityId: 'user-123',
      score: 100,
      timestamp: new Date(),
    };

    await service.deliver(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/hook',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
  });

  it('should not deliver when there are no active webhooks', async () => {
    mockWebhookRepository.find.mockResolvedValue([]);
    global.fetch = jest.fn();

    await service.deliver({
      event: 'entity.blocked',
      entityId: 'user-123',
      score: 100,
      timestamp: new Date(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should retry up to 3 times on delivery failure', async () => {
    const webhooks = [
      { id: 'uuid-1', url: 'https://example.com/hook', clientId: 'client-123', active: true, secret: null },
    ];
    mockWebhookRepository.find.mockResolvedValue(webhooks);
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

    await service.deliver({
      event: 'entity.blocked',
      entityId: 'user-123',
      score: 100,
      timestamp: new Date(),
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
  }, 10000);
});
