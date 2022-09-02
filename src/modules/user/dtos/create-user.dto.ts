import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  role?: Role;
}
