import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditEntity } from './audit.entity';
import { EntityState } from '../state/enums/entity-state.enum';
import { DecisionAction } from '../decision/enums/decision-action.enum';
import { ActionStatus } from '../action/enums/action-status.enum';

const mockAuditRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditEntity),
          useValue: mockAuditRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create and save an audit log', async () => {
    const dto = {
      entityId: 'user-123',
      score: 20,
      state: EntityState.NORMAL,
      action: DecisionAction.ALLOW,
      status: ActionStatus.EXECUTED,
    };
    const entity = { id: 'uuid-1', ...dto };

    mockAuditRepository.create.mockReturnValue(entity);
    mockAuditRepository.save.mockResolvedValue(entity);

    const result = await service.log(dto);

    expect(mockAuditRepository.create).toHaveBeenCalledWith(dto);
    expect(mockAuditRepository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should return all audit logs ordered by createdAt DESC', async () => {
    const logs = [
      { id: 'uuid-1', entityId: 'user-123', action: DecisionAction.ALLOW },
      { id: 'uuid-2', entityId: 'user-456', action: DecisionAction.BLOCK },
    ];
    mockAuditRepository.find.mockResolvedValue(logs);

    const result = await service.findAll();

    expect(mockAuditRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(logs);
  });

  it('should return audit logs by entityId', async () => {
    const logs = [
      { id: 'uuid-1', entityId: 'user-123', action: DecisionAction.ALLOW },
    ];
    mockAuditRepository.find.mockResolvedValue(logs);

    const result = await service.findByEntityId('user-123');

    expect(mockAuditRepository.find).toHaveBeenCalledWith({
      where: { entityId: 'user-123' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(logs);
  });
});
