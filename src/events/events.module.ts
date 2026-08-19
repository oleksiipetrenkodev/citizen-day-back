import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Registration } from '../registrations/entities/registration.entity';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Registration])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
