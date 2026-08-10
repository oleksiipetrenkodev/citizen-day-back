import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
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
}

@Entity('registrations')
@Unique(['userId', 'eventId'])
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

    @Column({ type: 'bigint', unique: true })
    @Generated('increment')
    sequenceNumber!: string;

    @CreateDateColumn()
    createdAt!: Date;
}