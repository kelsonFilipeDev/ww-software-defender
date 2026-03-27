import { Injectable } from '@nestjs/common';
import { RiskService } from '../risk/risk.service';
import { EntityState } from './enums/entity-state.enum';

@Injectable()
export class StateService {
  constructor(private readonly riskService: RiskService) {}

  async getState(
    entityId: string,
  ): Promise<{ entityId: string; score: number; state: EntityState }> {
    const score = await this.riskService.calculate(entityId);
    const state = this.resolveState(score);
    return { entityId, score, state };
  }

  private resolveState(score: number): EntityState {
    if (score <= 20) return EntityState.NORMAL;
    if (score <= 40) return EntityState.SUSPEITO;
    if (score <= 60) return EntityState.ALERTA;
    if (score <= 80) return EntityState.CRITICO;
    return EntityState.BLOQUEADO;
  }
}
