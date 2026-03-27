import { Controller, Get, Param } from '@nestjs/common';
import { StateService } from './state.service';

@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Get(':entityId')
  async getState(@Param('entityId') entityId: string) {
    return this.stateService.getState(entityId);
  }
}
