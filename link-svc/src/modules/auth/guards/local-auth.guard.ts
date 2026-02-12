import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import CONSTS from '../constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard(CONSTS.LOCAL) {}
