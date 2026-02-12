import { BeforeInsert, BeforeSoftRemove, BeforeUpdate, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IdEntity } from './id.entity';

export abstract class BaseEntity extends IdEntity {
    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @UpdateDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        default: () => null,
        nullable: true,
    })
    deletedAt: Date;

    @Column({
        name: 'is_deleted',
        type: 'boolean',
        default: false,
    })
    isDeleted: boolean;

    @BeforeInsert()
    setCreationMetadata() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    setUpdateMetadata() {
        this.updatedAt = new Date();
    }

    @BeforeSoftRemove()
    setDeleteMetadata() {
        this.deletedAt = new Date();
    }
}
