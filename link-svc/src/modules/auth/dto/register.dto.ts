import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'john_doe' })
    @IsString()
    @MinLength(3)
    @MaxLength(64)
    @Matches(/^[a-zA-Z0-9_.-]+$/, {
        message: 'Username can only contain letters, numbers, dots, underscores and hyphens',
    })
    login: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @MinLength(8)
    confirmPassword: string;

    @ApiProperty({ example: 'John Doe' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    username?: string;

    @ApiProperty({ example: 'local' })
    @IsOptional()
    @IsEnum(['local', 'oauth', 'email'])
    authMethod?: 'local' | 'oauth' | 'email' = 'local';
}
