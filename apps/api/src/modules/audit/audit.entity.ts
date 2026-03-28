import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { EntityState } from '../state/enums/entity-state.enum';
import { DecisionAction } from '../decision/enums/decision-action.enum';
import { ActionStatus } from '../action/enums/action-status.enum';

@Entity('audit_logs')
export class AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityId: string;

  @Column()
  score: number;

  @Column({ type: 'enum', enum: EntityState })
  state: EntityState;

  @Column({ type: 'enum', enum: DecisionAction })
  action: DecisionAction;

  @Column({ type: 'enum', enum: ActionStatus })
  status: ActionStatus;

  @Column({ nullable: true })
  correlationId: string;

  @CreateDateColumn()
  createdAt: Date;
}
