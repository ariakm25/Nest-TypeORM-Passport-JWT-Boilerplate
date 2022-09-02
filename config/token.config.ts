import { registerAs } from '@nestjs/config';

export default registerAs('token', () => ({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'jwtSecret',
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || '5h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'jwtRefreshSecret',
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '30d',
  resetPasswordTokenExpiration:
    process.env.RESET_PASSWORD_TOKEN_EXPIRATION_HOUR || 24,
  confirmEmailTokenExpiration:
    process.env.CONFIRM_EMAIL_TOKEN_EXPIRATION_HOUR || 24,
}));
