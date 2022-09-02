import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { AuthState } from '../entity/auth.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('token.accessTokenSecret'),
    });
  }

  async validate(payload: any): Promise<AuthState> {
    return {
      id: payload.sub,
      name: payload.name,
      role: payload.role,
      avatar: payload.avatar,
    };
  }
}
