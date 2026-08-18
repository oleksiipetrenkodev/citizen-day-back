import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
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

  findOne(id: number): Promise<Event | null> {
    return this.eventsRepository.findOneBy({ id });
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
