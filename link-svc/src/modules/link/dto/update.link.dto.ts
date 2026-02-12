import { IsOptional } from 'class-validator';

export class UpdateLinkDto {
    @IsOptional()
    originalUrl: string;

    @IsOptional()
    isActive: string;
}
