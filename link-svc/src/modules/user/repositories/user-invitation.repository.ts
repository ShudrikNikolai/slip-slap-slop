import { BaseRepository } from '@/common/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInvitation } from '../entities/user-invitation';

@Injectable()
export class UserInvitationRepository extends BaseRepository<UserInvitation> {
    protected readonly entityName = 'UserInvitation';

    constructor(
        @InjectRepository(UserInvitation)
        protected readonly repository: Repository<UserInvitation>,
    ) {
        super(repository);
    }
}
