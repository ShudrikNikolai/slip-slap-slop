import { BaseRepository } from '@/common/repositories/base.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserInvitation } from '../entities/user-invitation';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user.interface';
import { UserInvitationRepository } from './user-invitation.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
    protected readonly entityName = 'User'; //User.name; // TODO User.name

    constructor(
        @InjectRepository(User)
        protected readonly repository: Repository<User>,
        @InjectRepository(UserInvitation)
        private readonly userInvitationRep: UserInvitationRepository,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly dataSource: DataSource,
    ) {
        super(repository);
    }

    async countUsers(filter: Partial<User>): Promise<number> {
        return this.count(filter);
    }

    async existsUser(filter: Partial<User>): Promise<boolean> {
        return this.exists(filter);
    }

    async findUserById(id: string): Promise<User | null> {
        return this.findById(id);
    }

    async findByLogin(login: string): Promise<User | null> {
        return this.findOne({
            login,
        });
    }

    async updateUserById(id: string, data: Partial<User>): Promise<User | null> {
        return this.updateAndReturn(id, data);
    }

    async softDeleteUser(userId: string, deletedBy?: string): Promise<boolean> {
        return this.softDelete(userId, deletedBy);
    }

    async createWithTransaction(userData: Partial<CreateUserDto>): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            //@ts-ignore
            const user = queryRunner.manager.create(User, {
                ...userData,
                country: 'Unknown',
                city: 'Unknown',
                gender: 'none',
                authMethod: 'local',
            });

            const savedUser = await queryRunner.manager.save(user);

            await queryRunner.commitTransaction();
            return savedUser;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Transaction failed:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createInvitation(userId: string): Promise<UserInvitation | null> {
        const user = await this.findById(userId);

        if (!user) throw new NotFoundException('User not found');

        return this.userInvitationRep.create(user);
    }

    async softDeleteInvitation(id: string): Promise<boolean> {
        return this.userInvitationRep.softDelete(id);
    }
}
