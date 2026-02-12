import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_invitations')
export class UserInvitation extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    @Column('uuid')
    code: string;

    @ManyToOne(() => User, (user) => user.userInvitations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
