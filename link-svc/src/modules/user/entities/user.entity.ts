import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { UserInvitation } from './user-invitation';

@Entity('users')
@Index(['login'], { unique: true })
export class User extends BaseEntity {
    @Column({ type: 'varchar', length: 64, unique: true })
    login: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    username: string;

    @Column({
        name: 'auth_method',
        type: 'enum',
        enum: ['local', 'oauth', 'email'],
        default: 'local',
    })
    authMethod: 'local' | 'oauth' | 'email';

    @Column({ type: 'varchar', length: 64, nullable: true })
    country: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    city: string;

    @Column({
        name: 'birth_date',
        type: 'timestamptz',
        nullable: true, // Сделайте nullable если дата не обязательна
        default: () => 'CURRENT_TIMESTAMP',
    })
    birthDate: Date;

    @Column({
        type: 'enum',
        enum: ['none', 'male', 'female'],
        default: 'none',
    })
    gender: 'none' | 'male' | 'female';

    @Column({ name: 'password_hash', type: 'text', nullable: true })
    passwordHash: string;

    @Column({ name: 'hashed_refresh_token', type: 'text', nullable: true, select: false })
    hashedRefreshToken?: string;

    @OneToMany(() => UserInvitation, (userInvitation) => userInvitation.user, { cascade: true })
    userInvitations: UserInvitation[];

    getPublicData() {
        return {
            id: this.id,
            username: this.username,
            login: this.login,
            country: this.country,
            gender: this.gender,
            city: this.city,
            birthDate: this.birthDate,
        };
    }
}
