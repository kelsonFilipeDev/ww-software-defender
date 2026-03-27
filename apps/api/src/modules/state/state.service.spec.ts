import { Test, TestingModule } from '@nestjs/testing';
import { StateService } from './state.service';
import { RiskService } from '../risk/risk.service';
import { EntityState } from './enums/entity-state.enum';

const mockRiskService = {
  calculate: jest.fn(),
};

describe('StateService', () => {
  let service: StateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateService,
        { provide: RiskService, useValue: mockRiskService },
      ],
    }).compile();

    service = module.get<StateService>(StateService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return NORMAL for score 0', async () => {
    mockRiskService.calculate.mockResolvedValue(0);
    const result = await service.getState('user-123');
    expect(result.state).toBe(EntityState.NORMAL);
  });

  it('should return NORMAL for score 20', async () => {
    mockRiskService.calculate.mockResolvedValue(20);
    const result = await service.getState('user-123');
    expect(result.state).toBe(EntityState.NORMAL);
  });

  it('should return SUSPEITO for score 21', async () => {
    mockRiskService.calculate.mockResolvedValue(21);
    const result = await service.getState('user-123');
    expect(result.state).toBe(EntityState.SUSPEITO);
  });

  it('should return ALERTA for score 41', async () => {
    mockRiskService.calculate.mockResolvedValue(41);
    const result = await service.getState('user-123');
    expect(result.state).toBe(EntityState.ALERTA);
  });

  it('should return CRITICO for score 61', async () => {
    mockRiskService.calculate.mockResolvedValue(61);
    const result = await service.getState('user-123');
    expect(result.state).toBe(EntityState.CRITICO);
  });

  it('should return BLOQUEADO for score 81', async () => {
    mockRiskService.calculate.mockResolvedValue(81);
    const result = await service.getState('user-123');
    expect(result.state).toBe(EntityState.BLOQUEADO);
  });

  it('should return BLOQUEADO for score 100', async () => {
    mockRiskService.calculate.mockResolvedValue(100);
    const result = await service.getState('user-123');
    expect(result.state).toBe(EntityState.BLOQUEADO);
  });
});
