import { Test, TestingModule } from '@nestjs/testing';
import { DecisionService } from './decision.service';
import { StateService } from '../state/state.service';
import { EntityState } from '../state/enums/entity-state.enum';
import { DecisionAction } from './enums/decision-action.enum';

const mockStateService = {
  getState: jest.fn(),
};

describe('DecisionService', () => {
  let service: DecisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecisionService,
        { provide: StateService, useValue: mockStateService },
      ],
    }).compile();

    service = module.get<DecisionService>(DecisionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return ALLOW for NORMAL state', async () => {
    mockStateService.getState.mockResolvedValue({
      entityId: 'user-123',
      score: 10,
      state: EntityState.NORMAL,
    });
    const result = await service.decide('user-123');
    expect(result.action).toBe(DecisionAction.ALLOW);
  });

  it('should return THROTTLE for SUSPEITO state', async () => {
    mockStateService.getState.mockResolvedValue({
      entityId: 'user-123',
      score: 30,
      state: EntityState.SUSPEITO,
    });
    const result = await service.decide('user-123');
    expect(result.action).toBe(DecisionAction.THROTTLE);
  });

  it('should return CHALLENGE for ALERTA state', async () => {
    mockStateService.getState.mockResolvedValue({
      entityId: 'user-123',
      score: 50,
      state: EntityState.ALERTA,
    });
    const result = await service.decide('user-123');
    expect(result.action).toBe(DecisionAction.CHALLENGE);
  });

  it('should return BLOCK for CRITICO state', async () => {
    mockStateService.getState.mockResolvedValue({
      entityId: 'user-123',
      score: 70,
      state: EntityState.CRITICO,
    });
    const result = await service.decide('user-123');
    expect(result.action).toBe(DecisionAction.BLOCK);
  });

  it('should return BLOCK for BLOQUEADO state', async () => {
    mockStateService.getState.mockResolvedValue({
      entityId: 'user-123',
      score: 90,
      state: EntityState.BLOQUEADO,
    });
    const result = await service.decide('user-123');
    expect(result.action).toBe(DecisionAction.BLOCK);
  });

  it('should return complete decision result', async () => {
    mockStateService.getState.mockResolvedValue({
      entityId: 'user-123',
      score: 90,
      state: EntityState.BLOQUEADO,
    });
    const result = await service.decide('user-123');
    expect(result).toEqual({
      entityId: 'user-123',
      score: 90,
      state: EntityState.BLOQUEADO,
      action: DecisionAction.BLOCK,
    });
  });
});
