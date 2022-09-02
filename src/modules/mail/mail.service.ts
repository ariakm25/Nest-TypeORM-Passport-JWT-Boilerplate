import { InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { JobEnum } from 'src/common/enums/job.enum';
import { QueueEnum } from 'src/common/enums/queue.enum';

export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    @InjectQueue(QueueEnum.MailQueueName)
    private mailQueue: Queue,
  ) {}

  async sendResetPasswordEmail(email: string, token: string): Promise<boolean> {
    try {
      await this.mailQueue.add(JobEnum.sendResetPasswordEmail, {
        email,
        token,
      });
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
