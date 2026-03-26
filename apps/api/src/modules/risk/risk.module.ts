import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';

@Module({
  imports: [EventModule],
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
