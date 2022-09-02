import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3000,
  name: process.env.APP_NAME || 'Nest API',
  url: process.env.APP_URL || 'http://localhost:3000',
}));
