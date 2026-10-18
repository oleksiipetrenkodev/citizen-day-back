import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RegistrationStatus } from './registration.entity';

@Entity('cancellations')
export class Cancellation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  eventId!: number;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
  })
  previousStatus!: RegistrationStatus;

  @Column({ type: 'bigint' })
  sequenceNumber!: string;

  @CreateDateColumn()
  cancelledAt!: Date;
}
