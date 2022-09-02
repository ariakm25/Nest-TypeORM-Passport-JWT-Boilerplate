import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/modules/user/enums/role.enum';

export const ROLE_KEY = 'role';
export const RequredRole = (role: Role) => SetMetadata(ROLE_KEY, role);
