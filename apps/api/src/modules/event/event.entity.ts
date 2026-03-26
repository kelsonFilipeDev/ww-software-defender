import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown>;

  @Column({ nullable: true })
  correlationId: string;

  @CreateDateColumn()
  createdAt: Date;
}
