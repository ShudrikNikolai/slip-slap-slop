import { SetMetadata } from '@nestjs/common';
import CONSTS from '../constants';

export const Roles = (...roles: string[]) => SetMetadata(CONSTS.D_ROLES_KEY, roles);
