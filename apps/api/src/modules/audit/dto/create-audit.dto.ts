import { EntityState } from '../../state/enums/entity-state.enum';
import { DecisionAction } from '../../decision/enums/decision-action.enum';
import { ActionStatus } from '../../action/enums/action-status.enum';

export class CreateAuditDto {
  entityId: string;
  score: number;
  state: EntityState;
  action: DecisionAction;
  status: ActionStatus;
  correlationId?: string;
}
