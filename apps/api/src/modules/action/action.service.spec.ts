import { Test, TestingModule } from '@nestjs/testing';
import { ActionService } from './action.service';
import { DecisionService } from '../decision/decision.service';
import { AuditService } from '../audit/audit.service';
import { WebhookService } from '../webhooks/webhook.service';
import { DecisionAction } from '../decision/enums/decision-action.enum';
import { EntityState } from '../state/enums/entity-state.enum';
import { ActionStatus } from './enums/action-status.enum';

const mockDecisionService = {
  decide: jest.fn(),
};

const mockAuditService = {
  log: jest.fn(),
};

const mockWebhookService = {
  deliver: jest.fn(),
};

describe('ActionService', () => {
  let service: ActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionService,
        { provide: DecisionService, useValue: mockDecisionService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: WebhookService, useValue: mockWebhookService },
      ],
    }).compile();

    service = module.get<ActionService>(ActionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should execute ALLOW action', async () => {
    mockDecisionService.decide.mockResolvedValue({
      entityId: 'user-123',
      score: 10,
      state: EntityState.NORMAL,
      action: DecisionAction.ALLOW,
    });
    mockAuditService.log.mockResolvedValue({});

    const result = await service.execute('user-123');

    expect(result.action).toBe(DecisionAction.ALLOW);
    expect(result.status).toBe(ActionStatus.EXECUTED);
  });

  it('should execute THROTTLE action', async () => {
    mockDecisionService.decide.mockResolvedValue({
      entityId: 'user-123',
      score: 30,
      state: EntityState.SUSPEITO,
      action: DecisionAction.THROTTLE,
    });
    mockAuditService.log.mockResolvedValue({});

    const result = await service.execute('user-123');

    expect(result.action).toBe(DecisionAction.THROTTLE);
    expect(result.status).toBe(ActionStatus.EXECUTED);
  });

  it('should execute CHALLENGE action', async () => {
    mockDecisionService.decide.mockResolvedValue({
      entityId: 'user-123',
      score: 50,
      state: EntityState.ALERTA,
      action: DecisionAction.CHALLENGE,
    });
    mockAuditService.log.mockResolvedValue({});

    const result = await service.execute('user-123');

    expect(result.action).toBe(DecisionAction.CHALLENGE);
    expect(result.status).toBe(ActionStatus.EXECUTED);
  });

  it('should execute BLOCK action and deliver webhook', async () => {
    mockDecisionService.decide.mockResolvedValue({
      entityId: 'user-123',
      score: 90,
      state: EntityState.BLOQUEADO,
      action: DecisionAction.BLOCK,
    });
    mockAuditService.log.mockResolvedValue({});
    mockWebhookService.deliver.mockResolvedValue(undefined);

    const result = await service.execute('user-123');

    expect(result.action).toBe(DecisionAction.BLOCK);
    expect(result.status).toBe(ActionStatus.EXECUTED);
    expect(mockWebhookService.deliver).toHaveBeenCalledWith({
      event: 'entity.blocked',
      entityId: 'user-123',
      score: 90,
      timestamp: expect.any(Date) as Date,
    });
  });

  it('should not deliver webhook for non-BLOCK actions', async () => {
    mockDecisionService.decide.mockResolvedValue({
      entityId: 'user-123',
      score: 10,
      state: EntityState.NORMAL,
      action: DecisionAction.ALLOW,
    });
    mockAuditService.log.mockResolvedValue({});

    await service.execute('user-123');

    expect(mockWebhookService.deliver).not.toHaveBeenCalled();
  });

  it('should return entityId and executedAt', async () => {
    mockDecisionService.decide.mockResolvedValue({
      entityId: 'user-123',
      score: 10,
      state: EntityState.NORMAL,
      action: DecisionAction.ALLOW,
    });
    mockAuditService.log.mockResolvedValue({});

    const result = await service.execute('user-123');

    expect(result.entityId).toBe('user-123');
    expect(result.executedAt).toBeInstanceOf(Date);
  });

  it('should call auditService.log with correct data', async () => {
    mockDecisionService.decide.mockResolvedValue({
      entityId: 'user-123',
      score: 10,
      state: EntityState.NORMAL,
      action: DecisionAction.ALLOW,
    });
    mockAuditService.log.mockResolvedValue({});

    await service.execute('user-123');

    expect(mockAuditService.log).toHaveBeenCalledWith({
      entityId: 'user-123',
      score: 10,
      state: EntityState.NORMAL,
      action: DecisionAction.ALLOW,
      status: ActionStatus.EXECUTED,
    });
  });
});
