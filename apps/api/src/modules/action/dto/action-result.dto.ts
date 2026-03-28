import { DecisionAction } from '../../decision/enums/decision-action.enum';
import { ActionStatus } from '../enums/action-status.enum';

export class ActionResultDto {
  entityId: string;
  action: DecisionAction;
  status: ActionStatus;
  executedAt: Date;
}