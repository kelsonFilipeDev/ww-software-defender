import { Test, TestingModule } from '@nestjs/testing';
import { RiskService } from './risk.service';
import { EventService } from '../event/event.service';

const mockEventService = {
  findByEntityId: jest.fn(),
};

describe('RiskService', () => {
  let service: RiskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskService,
        { provide: EventService, useValue: mockEventService },
      ],
    }).compile();

    service = module.get<RiskService>(RiskService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return 0 when no events exist', async () => {
    mockEventService.findByEntityId.mockResolvedValue([]);
    const score = await service.calculate('user-123');
    expect(score).toBe(0);
  });

  it('should calculate score for LoginFailed', async () => {
    mockEventService.findByEntityId.mockResolvedValue([
      { type: 'LoginFailed' },
    ]);
    const score = await service.calculate('user-123');
    expect(score).toBe(5);
  });

  it('should sum multiple events correctly', async () => {
    mockEventService.findByEntityId.mockResolvedValue([
      { type: 'LoginFailed' },
      { type: 'SuspiciousIp' },
      { type: 'PasswordReset' },
    ]);
    const score = await service.calculate('user-123');
    expect(score).toBe(50);
  });

  it('should cap score at 100', async () => {
    mockEventService.findByEntityId.mockResolvedValue([
      { type: 'PasswordReset' },
      { type: 'PasswordReset' },
      { type: 'PasswordReset' },
      { type: 'PasswordReset' },
      { type: 'PasswordReset' },
    ]);
    const score = await service.calculate('user-123');
    expect(score).toBe(100);
  });

  it('should ignore unknown event types', async () => {
    mockEventService.findByEntityId.mockResolvedValue([
      { type: 'UnknownEvent' },
    ]);
    const score = await service.calculate('user-123');
    expect(score).toBe(0);
  });
});
