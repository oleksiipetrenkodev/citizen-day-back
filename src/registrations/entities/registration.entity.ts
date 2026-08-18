import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

export enum RegistrationStatus {
  CONFIRMED = 'confirmed',
  WAITLISTED = 'waitlisted',
  CANCELLED = 'cancelled',
}

@Entity('registrations')
@Unique(['userId', 'eventId'])
@Unique(['eventId', 'sequenceNumber'])
@Index(['eventId', 'status', 'sequenceNumber'])
export class Registration {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  eventId!: number;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
  })
  status!: RegistrationStatus;

  // Per-event FIFO order. Allocated as MAX(sequenceNumber)+1 for the event
  // while the event row is locked, so it is race-free. bigint maps to string.
  @Column({ type: 'bigint' })
  sequenceNumber!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
