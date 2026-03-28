import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActionService } from './action.service';

@UseGuards(JwtAuthGuard)
@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post(':entityId')
  async execute(@Param('entityId') entityId: string) {
    return this.actionService.execute(entityId);
  }
}
