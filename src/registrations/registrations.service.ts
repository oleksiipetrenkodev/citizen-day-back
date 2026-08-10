import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { Cancellation } from './entities/cancellation.entity';
import { Registration } from './entities/registration.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    private readonly dataSource: DataSource,
  ) { }

  create(createRegistrationDto: CreateRegistrationDto) {
    return 'This action adds a new registration';
  }

  findAll() {
    return this.registrationsRepository.find();
  }

  findOne(id: number) {
    return this.registrationsRepository.findOneBy({ id });
  }

  update(id: number, updateRegistrationDto: UpdateRegistrationDto) {
    return `This action updates a #${id} registration`;
  }

  async remove(id: number): Promise<Cancellation> {
    return this.dataSource.transaction(async (manager) => {
      const registration = await manager.findOneBy(Registration, { id });

      if (!registration) {
        throw new NotFoundException(`Registration #${id} not found`);
      }

      const cancellation = manager.create(Cancellation, {
        userId: registration.userId,
        eventId: registration.eventId,
        previousStatus: registration.status,
        sequenceNumber: registration.sequenceNumber,
      });

      const savedCancellation = await manager.save(cancellation);
      await manager.remove(registration);

      return savedCancellation;
    });
  }
}
