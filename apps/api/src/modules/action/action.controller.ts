import { Controller, Post, Param } from '@nestjs/common';
import { ActionService } from './action.service';

@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post(':entityId')
  async execute(@Param('entityId') entityId: string) {
    return this.actionService.execute(entityId);
  }
}