import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    login: string;

    @IsNotEmpty()
    password: string;

    @IsOptional()
    username: string;

    @IsOptional()
    passwordHash?: string | null;

    @IsNotEmpty()
    authMethod: 'local' | 'oauth' | 'email';
}
