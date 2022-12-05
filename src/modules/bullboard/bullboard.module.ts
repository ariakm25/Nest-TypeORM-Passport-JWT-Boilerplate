import { BullModule, getQueueToken } from '@nestjs/bull';
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Queue } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { QueueEnum } from 'src/common/enums/queue.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as basicAuth from 'express-basic-auth';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueEnum.MailQueueName,
    }),
    ConfigModule,
  ],
})
export class BullBoardModule implements NestModule {
  @Inject(getQueueToken(QueueEnum.MailQueueName))
  private readonly mailQueue: Queue;

  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    createBullBoard({
      queues: [new BullAdapter(this.mailQueue)],
      serverAdapter,
    });
    serverAdapter.setBasePath('/bullboard');

    const bullboardUsername =
      this.configService.get<string>('bullboard.username');
    const bullboardPassword =
      this.configService.get<string>('bullboard.password');

    consumer
      .apply(
        basicAuth({
          challenge: true,
          users: {
            [bullboardUsername]: bullboardPassword,
          },
        }),
        serverAdapter.getRouter(),
      )
      .forRoutes('/bullboard');
  }
}
