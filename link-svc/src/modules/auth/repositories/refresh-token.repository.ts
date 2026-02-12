import { BaseRepository } from '@/common/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
    protected readonly entityName = RefreshToken.name || 'RefreshToken';

    constructor(
        @InjectRepository(RefreshToken)
        protected readonly repository: Repository<RefreshToken>,
    ) {
        super(repository);
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.findOne({ token }, undefined, undefined, ['user']);
    }

    async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
        const refreshToken = {
            userId,
            token,
            expiresAt,
        };

        return this.create(refreshToken);
    }

    async revokeToken(token: string, revokedBy?: string, reason?: string): Promise<void> {
        const refreshToken = await this.findByToken(token);
        if (refreshToken) {
            refreshToken.revoke(revokedBy, reason);
            await this.repository.save(refreshToken);
        }
    }

    async revokeAllForUser(userId: string, revokedBy?: string): Promise<void> {
        const tokens = await this.findMany({ userId, isRevoked: false });

        for (const token of tokens) {
            token.revoke(revokedBy, 'Revoked all tokens');
            await this.repository.save(token);
        }
    }

    async deleteExpiredTokens(): Promise<void> {
        await this.repository.createQueryBuilder().delete().where('expiresAt < :now', { now: new Date() }).execute();
    }
}
