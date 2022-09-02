import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
});

const configService = new ConfigService();

export default new DataSource({
  type: configService.get<any>('DATABASE_TYPE'),
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  useUTC: true,
  migrations: [join(__dirname, '/src/database/migrations/*{.ts,.js}')],
  entities: [join(__dirname, '/src/*/**/entities/*{.ts,.js}')],
});
