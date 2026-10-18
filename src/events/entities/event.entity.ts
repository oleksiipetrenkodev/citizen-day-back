import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  // Immutable reference to the CMS entry that owns this event's content.
  // Stable join key between the CMS, the front end, and registration data
  // (unlike the editable slug).
  @Column({ unique: true })
  cmsId!: string;

  @Column()
  capacity!: number;

  @Column({ type: 'timestamp' })
  registrationStartsAt!: Date;

  @Column({ type: 'timestamp' })
  registrationEndsAt!: Date;

  @Column()
  status!: string; // TODO: add enum
}
