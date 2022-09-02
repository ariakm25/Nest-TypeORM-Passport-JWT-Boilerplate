import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    example: 'admin@admin.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'password',
  })
  password: string;
}
