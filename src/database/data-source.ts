import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { createDatabaseOptions } from './database.config';

export default new DataSource({
  ...createDatabaseOptions(new ConfigService()),
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
