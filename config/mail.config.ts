import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'SMTP',
  port: process.env.MAIL_PORT || 2525,
  user: process.env.MAIL_USER || 'user',
  password: process.env.MAIL_PASSWORD || 'password',
  secure: process.env.MAIL_SECURE || false,
  senderName: process.env.MAIL_SENDER_NAME || 'Nest API',
  senderEmail: process.env.MAIL_SENDER_EMAIL || 'nest-api@example.com',
}));
