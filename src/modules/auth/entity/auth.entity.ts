import { Role } from 'src/modules/user/enums/role.enum';

export interface AuthState {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}
