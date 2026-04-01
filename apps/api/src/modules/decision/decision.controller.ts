import { Controller, Get, Param } from '@nestjs/common';
import { DecisionService } from './decision.service';

@Controller('decision')
export class DecisionController {
  constructor(private readonly decisionService: DecisionService) {}

  @Get(':entityId')
  async decide(@Param('entityId') entityId: string) {
    return this.decisionService.decide(entityId);
  }
}
