import { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';

import { Event } from '../events/entities/event.entity';
import { Cancellation } from '../registrations/entities/cancellation.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { User } from '../users/entities/user.entity';

export function createDatabaseOptions(
  config: ConfigService,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DB_HOST'),
    port: Number(config.getOrThrow<string>('DB_PORT')),
    username: config.getOrThrow<string>('DB_USERNAME'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    database: config.getOrThrow<string>('DB_DATABASE'),
    entities: [User, Event, Registration, Cancellation],
    synchronize: false,
  };
}
