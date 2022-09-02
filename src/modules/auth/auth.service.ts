import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { compareSync } from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { TokenService } from '../token/token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenType } from 'src/common/enums/token-type.enum';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserService } from '../user/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user: User = await this.usersService.findOneBy('email', email);

    if (user) {
      const isValid = compareSync(password, user.password);

      if (isValid) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          access_token: this.tokenService.createAccessToken(user),
          refresh_token: await this.tokenService.createRefreshToken(user),
        };
      }
    }
    throw new BadRequestException(['email or password is incorrect']);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
    const { refresh_token } = refreshTokenDto;

    const verify = await this.tokenService.validateRefreshToken(refresh_token);

    if (typeof verify === 'number') {
      const user: User = await this.usersService.findOne(verify);

      if (!user) {
        throw new BadRequestException(['invalid user refresh token']);
      }

      await this.tokenService.deleteToken(
        refresh_token,
        TokenType.RefreshToken,
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        access_token: this.tokenService.createAccessToken(user),
        refresh_token: await this.tokenService.createRefreshToken(user),
      };
    }

    throw new BadRequestException(['invalid refresh token']);
  }

  async sendResetPasswordEmail(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    const user: User = await this.usersService.findOneBy(
      'email',
      resetPasswordDto.email,
    );
    if (!user) {
      return false;
    }

    const checkToken = await this.tokenService.isTokenRecentlyAdded(
      user.id,
      TokenType.ResetPassword,
    );

    if (checkToken) {
      throw new BadRequestException([
        'token already sent, please wait for 5 minutes to send new token',
      ]);
    }

    const token = await this.tokenService.createRandomTokenForUser(
      user,
      TokenType.ResetPassword,
    );

    try {
      await this.mailService.sendResetPasswordEmail(user.email, token);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return true;
  }

  async updatePassword(updatePassword: UpdatePasswordDto): Promise<boolean> {
    const { password, token } = updatePassword;
    const checkToken = await this.tokenService.getToken(
      token,
      TokenType.ResetPassword,
      true,
    );

    if (!checkToken) {
      throw new BadRequestException(['invalid token']);
    }

    await this.usersService.updatePassword(checkToken.user.id, password);

    await this.tokenService.deleteAllUserTokens(checkToken.user.id);

    return true;
  }

  async logout(id: number): Promise<boolean> {
    await this.tokenService.deleteAllUserTokens(id, TokenType.RefreshToken);
    return true;
  }

  async me(id: number): Promise<User> {
    return await this.usersService.findOne(id);
  }
}
