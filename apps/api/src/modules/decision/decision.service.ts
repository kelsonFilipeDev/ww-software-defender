import { Injectable } from '@nestjs/common';
import { StateService } from '../state/state.service';
import { EntityState } from '../state/enums/entity-state.enum';
import { DecisionAction } from './enums/decision-action.enum';
import { DecisionResultDto } from './dto/decision-result.dto';

const STATE_TO_ACTION: Record<EntityState, DecisionAction> = {
  [EntityState.NORMAL]: DecisionAction.ALLOW,
  [EntityState.SUSPEITO]: DecisionAction.THROTTLE,
  [EntityState.ALERTA]: DecisionAction.CHALLENGE,
  [EntityState.CRITICO]: DecisionAction.BLOCK,
  [EntityState.BLOQUEADO]: DecisionAction.BLOCK,
};

@Injectable()
export class DecisionService {
  constructor(private readonly stateService: StateService) {}

  async decide(entityId: string): Promise<DecisionResultDto> {
    const { score, state } = await this.stateService.getState(entityId);
    const action = STATE_TO_ACTION[state];

    return { entityId, score, state, action };
  }
}