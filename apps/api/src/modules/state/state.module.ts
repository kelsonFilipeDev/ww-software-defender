import { Module } from '@nestjs/common';
import { RiskModule } from '../risk/risk.module';
import { StateService } from './state.service';
import { StateController } from './state.controller';

@Module({
  imports: [RiskModule],
  controllers: [StateController],
  providers: [StateService],
  exports: [StateService],
})
export class StateModule {}
