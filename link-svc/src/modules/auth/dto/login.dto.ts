import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'john_doe!' })
    @IsString()
    @MinLength(6)
    login: string;
}
