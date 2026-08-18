import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Cancellation } from './entities/cancellation.entity';
import {
  Registration,
  RegistrationStatus,
} from './entities/registration.entity';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    const { email, eventId } = createRegistrationDto;

    return this.dataSource.transaction(async (manager) => {
      const user = await this.findOrCreateUser(manager, email);

      // Lock the event row (SELECT ... FOR UPDATE). This serializes all
      // concurrent registrations for THIS event, which is what prevents
      // overbooking and makes the sequenceNumber allocation race-free.
      const event = await manager.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundException(`Event #${eventId} not found`);
      }

      const now = new Date();
      if (now < event.registrationStartsAt || now > event.registrationEndsAt) {
        throw new BadRequestException(
          'Registration is not open for this event',
        );
      }

      const existing = await manager.findOne(Registration, {
        where: { userId: user.id, eventId },
      });

      if (existing && existing.status !== RegistrationStatus.CANCELLED) {
        throw new ConflictException(
          'User is already registered for this event',
        );
      }

      // Source of truth for capacity is a live COUNT of confirmed rows, not a
      // stored counter. Safe because the event row is locked, so no one else
      // can confirm a registration for this event concurrently.
      const confirmedCount = await this.countConfirmed(manager, eventId);
      const status =
        confirmedCount < event.capacity
          ? RegistrationStatus.CONFIRMED
          : RegistrationStatus.WAITLISTED;

      const sequenceNumber = await this.nextSequenceNumber(manager, eventId);

      const registration =
        existing ?? manager.create(Registration, { userId: user.id, eventId });

      registration.status = status;
      registration.sequenceNumber = sequenceNumber;

      return manager.save(registration);
    });
  }

  findAll(): Promise<Registration[]> {
    return this.registrationsRepository.find();
  }

  findOne(id: number): Promise<Registration | null> {
    return this.registrationsRepository.findOneBy({ id });
  }

  update(id: number): string {
    return `This action updates a #${id} registration`;
  }

  async remove(id: number): Promise<Cancellation> {
    return this.dataSource.transaction(async (manager) => {
      const registration = await manager.findOneBy(Registration, { id });

      if (!registration) {
        throw new NotFoundException(`Registration #${id} not found`);
      }

      if (registration.status === RegistrationStatus.CANCELLED) {
        throw new ConflictException(`Registration #${id} is already cancelled`);
      }

      // Lock the event row to serialize against concurrent registrations for
      // the same event (they rely on a live COUNT of confirmed rows).
      await manager.findOne(Event, {
        where: { id: registration.eventId },
        lock: { mode: 'pessimistic_write' },
      });

      const cancellation = manager.create(Cancellation, {
        userId: registration.userId,
        eventId: registration.eventId,
        previousStatus: registration.status,
        sequenceNumber: registration.sequenceNumber,
      });
      const savedCancellation = await manager.save(cancellation);

      // Soft cancel: keep the row so re-registration can reuse it. Setting the
      // status to CANCELLED automatically frees the slot, since capacity is a
      // COUNT of CONFIRMED rows.
      registration.status = RegistrationStatus.CANCELLED;
      await manager.save(registration);

      // TODO: add auto-promotion functionality for waitlisted users here.
      // When a CONFIRMED registration is cancelled, promote the head of the
      // waitlist (lowest sequenceNumber among WAITLISTED) to CONFIRMED.

      return savedCancellation;
    });
  }

  private async findOrCreateUser(
    manager: EntityManager,
    rawEmail: string,
  ): Promise<User> {
    // Normalize so "Bob@X.com" and "bob@x.com " map to one user and the
    // UNIQUE(email) constraint actually prevents duplicate people.
    const email = rawEmail.trim().toLowerCase();

    const existing = await manager.findOne(User, { where: { email } });
    if (existing) {
      return existing;
    }

    try {
      return await manager.save(manager.create(User, { email }));
    } catch (error) {
      // Two first-time requests for the same email can race; the UNIQUE(email)
      // constraint rejects the loser, so we just re-read the winner's row.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION
      ) {
        return manager.findOneOrFail(User, { where: { email } });
      }
      throw error;
    }
  }

  private countConfirmed(
    manager: EntityManager,
    eventId: number,
  ): Promise<number> {
    return manager.count(Registration, {
      where: { eventId, status: RegistrationStatus.CONFIRMED },
    });
  }

  private async nextSequenceNumber(
    manager: EntityManager,
    eventId: number,
  ): Promise<string> {
    // Safe because the event row is locked for the duration of the transaction.
    // Cancelled rows keep their number, so MAX stays monotonic across cancels.
    const row = await manager
      .createQueryBuilder(Registration, 'r')
      .select('MAX(r.sequenceNumber)', 'max')
      .where('r.eventId = :eventId', { eventId })
      .getRawOne<{ max: string | null }>();

    return (BigInt(row?.max ?? '0') + 1n).toString();
  }
}
