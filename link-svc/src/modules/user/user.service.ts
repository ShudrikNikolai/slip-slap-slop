import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'; // TODO
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async create(createUserDto: CreateUserDto): Promise<any> {
        // Проверка существования пользователя
        const existingUser = await this.userRepository.existsUser({ login: createUserDto.login });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Хэширование пароля
        const passwordHash = createUserDto.password ? await bcrypt.hash(createUserDto.password, 10) : null;

        // Создание с транзакцией
        const user = await this.userRepository.createWithTransaction({
            username: createUserDto.username,
            passwordHash,
            authMethod: createUserDto.password ? 'local' : 'oauth',
        });

        return this.sanitizeUser(user);
    }

    async findById(id: string): Promise<any> {
        const user = await this.userRepository.findById(id);

        return this.sanitizeUser(user);
    }

    async findByUsername(username: string): Promise<any> {
        const user = await this.userRepository.findByLogin(username);

        return this.sanitizeUser(user);
    }

    async updateById(id: string, data: Partial<UpdateUserDto>): Promise<User | null> {
        return this.userRepository.update(id, data);
    }

    private sanitizeUser(user: any): any {
        return user.getPublicData();
    }
}
