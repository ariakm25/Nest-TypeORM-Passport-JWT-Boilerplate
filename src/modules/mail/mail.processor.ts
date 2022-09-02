import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { JobEnum } from 'src/common/enums/job.enum';
import { QueueEnum } from 'src/common/enums/queue.enum';

@Processor(QueueEnum.MailQueueName)
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process(JobEnum.sendResetPasswordEmail)
  async sendResetPasswordEmail(job: Job): Promise<any> {
    try {
      const result = await this.mailerService.sendMail({
        template: 'reset-password',
        subject: `Reset Password`,
        to: job.data.email,
        context: {
          expiration: this.configService.get(
            'token.resetPasswordTokenExpiration',
          ),
          url:
            this.configService.get('app.url') +
            '/reset-password?token=' +
            job.data.token,
        },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send reset password email to '${job.data.email}'`,
        error.stack,
      );
      throw error;
    }
  }
}
