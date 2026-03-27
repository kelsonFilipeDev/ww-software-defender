import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';

const EVENT_WEIGHTS: Record<string, number> = {
  LoginFailed: 5,
  LoginFailedRepeat: 10,
  SuspiciousIp: 20,
  PasswordReset: 25,
};

const MAX_RISK_SCORE = 100;

@Injectable()
export class RiskService {
  constructor(private readonly eventService: EventService) {}

  async calculate(entityId: string): Promise<number> {
    const events = await this.eventService.findByEntityId(entityId);

    const score = events.reduce((total, event) => {
      const weight = EVENT_WEIGHTS[event.type] ?? 0;
      return total + weight;
    }, 0);

    return Math.min(score, MAX_RISK_SCORE);
  }
}
