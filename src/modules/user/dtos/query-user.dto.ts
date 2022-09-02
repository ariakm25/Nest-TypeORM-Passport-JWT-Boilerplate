import { Role } from '../enums/role.enum';

export class QueryUserDto {
  name?: string;
  email?: string;
  role?: Role;
}
