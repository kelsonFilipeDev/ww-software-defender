import { EntityState } from '../../state/enums/entity-state.enum';
import { DecisionAction } from '../enums/decision-action.enum';

export class DecisionResultDto {
  entityId: string;
  score: number;
  state: EntityState;
  action: DecisionAction;
}
