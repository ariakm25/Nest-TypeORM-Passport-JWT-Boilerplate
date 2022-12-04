import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { RedisOptions } from 'ioredis';
import { BullBoardModule } from './modules/bullboard/bullboard.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';

import mailConfig from 'config/mail.config';
import appConfig from 'config/app.config';
import databaseConfig from 'config/database.config';
import tokenConfig from 'config/token.config';
import redisConfig from 'config/redis.config';
import bullboardConfig from 'config/bullboard.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${
        process.env.NODE_ENV == 'production' ? '.env' : '.env.dev'
      }`,
      load: [
        appConfig,
        databaseConfig,
        tokenConfig,
        mailConfig,
        redisConfig,
        bullboardConfig,
      ],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get<any>('database.type'),
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          migrationsRun: false,
          useUTC: true,
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let redisConfig: RedisOptions = {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          username: configService.get<string>('redis.username'),
          password: configService.get<string>('redis.password'),
        };

        const isTls: string = configService.get<string>('redis.isTls');

        if (isTls == 'true') {
          redisConfig = {
            ...redisConfig,
            tls: {
              host: configService.get<string>('redis.tls.host'),
            },
          };
        }

        const maxCompletedJobs = configService.get<number>(
          'redis.maxCompletedJobs',
        );

        return {
          redis: redisConfig,
          defaultJobOptions: {
            removeOnComplete: {
              count: maxCompletedJobs,
            },
          },
        };
      },
    }),
    BullBoardModule,
    MailerModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 120,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
