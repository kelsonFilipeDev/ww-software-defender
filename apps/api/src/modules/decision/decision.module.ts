import { Module } from '@nestjs/common';
import { StateModule } from '../state/state.module';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';

@Module({
  imports: [StateModule],
  controllers: [DecisionController],
  providers: [DecisionService],
  exports: [DecisionService],
})
export class DecisionModule {}
