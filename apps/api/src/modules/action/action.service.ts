import { Injectable, Logger } from '@nestjs/common';
import { DecisionService } from '../decision/decision.service';
import { DecisionAction } from '../decision/enums/decision-action.enum';
import { ActionStatus } from './enums/action-status.enum';
import { ActionResultDto } from './dto/action-result.dto';

@Injectable()
export class ActionService {
  private readonly logger = new Logger(ActionService.name);

  constructor(private readonly decisionService: DecisionService) {}

  async execute(entityId: string): Promise<ActionResultDto> {
    const { action } = await this.decisionService.decide(entityId);

    const result: ActionResultDto = {
      entityId,
      action,
      status: ActionStatus.EXECUTED,
      executedAt: new Date(),
    };

    this.applyAction(entityId, action);

    return result;
  }

  private applyAction(entityId: string, action: DecisionAction): void {
    switch (action) {
      case DecisionAction.ALLOW:
        this.logger.log(`[ALLOW] entity=${entityId} — access permitted`);
        break;
      case DecisionAction.THROTTLE:
        this.logger.warn(`[THROTTLE] entity=${entityId} — rate limited`);
        break;
      case DecisionAction.CHALLENGE:
        this.logger.warn(`[CHALLENGE] entity=${entityId} — challenge required`);
        break;
      case DecisionAction.BLOCK:
        this.logger.error(`[BLOCK] entity=${entityId} — access blocked`);
        break;
    }
  }
}