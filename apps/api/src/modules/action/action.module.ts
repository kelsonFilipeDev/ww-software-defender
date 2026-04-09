import { Module } from '@nestjs/common';
import { DecisionModule } from '../decision/decision.module';
import { AuditModule } from '../audit/audit.module';
import { WebhookModule } from '../webhooks/webhook.module';
import { ActionService } from './action.service';
import { ActionController } from './action.controller';

@Module({
  imports: [DecisionModule, AuditModule, WebhookModule],
  controllers: [ActionController],
  providers: [ActionService],
  exports: [ActionService],
})
export class ActionModule {}
