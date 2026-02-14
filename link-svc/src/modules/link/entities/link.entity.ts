import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('links')
@Index(['shortCode'], { unique: true })
@Index(['shortCode', 'isDeleted'], { unique: true })
export class LinkEntity extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'original_url', default: '' })
    originalUrl: string;

    @Column({
        name: 'short_code',
        type: 'varchar',
        length: 50,
        default: null,
        nullable: true
    })
    shortCode: string;

    @Column({ default: 0 })
    clicks: number;

    getPublicData() {
        return {
            id: this.id,
            userId: this.userId,
            originalUrl: this.originalUrl,
            shortCode: this.shortCode,
            clicks: this.clicks,
        };
    }
}
