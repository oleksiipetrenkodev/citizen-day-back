import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';
import { RegistrationStatus } from './registration.entity';

@Entity('cancellations')
export class Cancellation {
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
    previousStatus!: RegistrationStatus;

    @Column({ type: 'bigint' })
    sequenceNumber!: string;

    @CreateDateColumn()
    cancelledAt!: Date;
}
