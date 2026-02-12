import { IsDate, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsEnum(['none', 'male', 'female'])
    gender?: 'none' | 'male' | 'female';

    @IsOptional()
    @IsDate()
    birthDate?: Date;
}
