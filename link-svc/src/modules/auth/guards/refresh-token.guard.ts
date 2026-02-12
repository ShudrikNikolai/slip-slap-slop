import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import CONSTS from '../constants';

@Injectable()
export class RefreshTokenGuard extends AuthGuard(CONSTS.JWT_REFRESH) {}
