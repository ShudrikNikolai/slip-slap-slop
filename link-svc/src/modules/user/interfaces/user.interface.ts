import { User } from '../entities/user.entity';

export interface IUserRepository {
    findByLogin(username: string): Promise<User | null>;
    createWithTransaction(data: any): Promise<User | null>;
}
