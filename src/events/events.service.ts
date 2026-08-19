import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Registration,
  RegistrationStatus,
} from '../registrations/entities/registration.entity';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

type EventWithConfirmedCount = Event & { confirmedCount: number };

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
  ) {}

  create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create({
      capacity: createEventDto.capacity,
      registrationStartsAt: new Date(createEventDto.registrationStartsAt),
      registrationEndsAt: new Date(createEventDto.registrationEndsAt),
      status: createEventDto.status,
    });

    return this.eventsRepository.save(event);
  }

  findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  async findOne(id: number): Promise<EventWithConfirmedCount> {
    const event = await this.eventsRepository.findOneBy({ id });

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    const confirmedCount = await this.registrationsRepository.count({
      where: { eventId: id, status: RegistrationStatus.CONFIRMED },
    });

    return { ...event, confirmedCount };
  }

  update(id: number) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
