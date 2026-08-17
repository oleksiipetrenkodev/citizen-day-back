import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    capacity!: number;

    @Column()
    confirmedCount!: number;

    @Column({ type: 'timestamp' })
    registrationStartsAt!: Date;

    @Column({ type: 'timestamp' })
    registrationEndsAt!: Date;

    @Column()
    status!: string;
}
