import { Module } from '@nestjs/common';
import { DecisionModule } from '../decision/decision.module';
import { AuditModule } from '../audit/audit.module';
import { ActionService } from './action.service';
import { ActionController } from './action.controller';

@Module({
  imports: [DecisionModule, AuditModule],
  controllers: [ActionController],
  providers: [ActionService],
  exports: [ActionService],
})
export class ActionModule {}
