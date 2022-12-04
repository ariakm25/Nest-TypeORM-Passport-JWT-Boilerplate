import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || '',
  isTls: process.env.REDIS_IS_TLS || false,
  tls: {
    host: process.env.REDIS_TLS_HOST || 'localhost',
  },
  maxCompletedJobs: process.env.REDIS_MAX_COMPLETED_JOBS || 1000,
}));
