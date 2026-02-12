import { SetMetadata } from '@nestjs/common';
import CONSTS from '../constants';

export const Public = () => SetMetadata(CONSTS.D_IS_PUBLIC_KEY, true);
