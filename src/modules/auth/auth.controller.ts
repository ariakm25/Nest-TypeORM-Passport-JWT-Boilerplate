import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({
    summary: 'User Login',
    description:
      'Login to get access token & refresh token by email & password',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh')
  @ApiOperation({
    summary: 'User Refresh Token',
    description: 'Get new access token & refresh token by refresh token',
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('/reset-password')
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Get Reset Password Link from Email',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.sendResetPasswordEmail(resetPasswordDto);
  }

  @Post('/update-password')
  @ApiOperation({
    summary: 'Update Password By Token',
    description: 'Update Password by Token from Email',
  })
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'User Profile',
    description: 'Get current authenticated user profile',
  })
  @ApiBearerAuth()
  me(@Req() request: any) {
    return this.authService.me(request.user.id);
  }

  @Post('/logout')
  @ApiOperation({
    summary: 'User Logout',
    description: 'Logout current authenticated user',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@Req() request: any) {
    if (request.user) {
      return this.authService.logout(request.user.id);
    }
    return false;
  }
}
