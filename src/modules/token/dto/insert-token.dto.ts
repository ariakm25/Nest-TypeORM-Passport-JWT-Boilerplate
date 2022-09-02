import { IsNotEmpty, IsOptional } from 'class-validator';
import { TokenType } from 'src/common/enums/token-type.enum';
import { User } from 'src/modules/user/entities/user.entity';

export class InsertTokenDto {
  @IsNotEmpty()
  user: User;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  type: TokenType;

  @IsOptional()
  expires?: Date;
}
