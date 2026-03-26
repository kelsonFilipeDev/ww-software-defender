import { Controller, Get, Param } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get(':entityId')
  async calculate(@Param('entityId') entityId: string) {
    const score = await this.riskService.calculate(entityId);
    return { entityId, score };
  }
}
