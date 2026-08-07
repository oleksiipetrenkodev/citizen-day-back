import { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';

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
    entities: [User],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
  };
}
