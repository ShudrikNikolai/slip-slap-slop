import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('refresh_tokens')
@Index(['token', 'isRevoked'])
export class RefreshToken extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'text', unique: true })
    token: string;

    @Column({ name: 'is_revoked', default: false })
    isRevoked: boolean;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
    revokedAt: Date;

    @Column({ name: 'revoked_by', type: 'varchar', length: 100, nullable: true })
    revokedBy: string | undefined;

    @Column({ name: 'revoked_reason', type: 'varchar', length: 255, nullable: true })
    revokedReason: string | undefined;

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isValid(): boolean {
        return !this.isRevoked && !this.isExpired();
    }

    revoke(revokedBy?: string, reason?: string): void {
        this.isRevoked = true;
        this.revokedAt = new Date();
        this.revokedBy = revokedBy;
        this.revokedReason = reason;
    }
}
