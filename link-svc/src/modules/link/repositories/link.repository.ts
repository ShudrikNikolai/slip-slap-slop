import { BaseRepository } from '@/common/repositories/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkEntity } from '../entities/link.entity';

export class LinkRepository extends BaseRepository<LinkEntity> {
    protected readonly entityName = 'Link';

    constructor(
        @InjectRepository(LinkEntity)
        protected readonly repository: Repository<LinkEntity>,
    ) {
        super(repository);
    }

    async createLink(userId: string, linkDataDto: Partial<LinkEntity>): Promise<LinkEntity | null> {
        return this.create({ userId, ...linkDataDto });
    }

    async updateLink(id: string, linkDataDto: Partial<LinkEntity>): Promise<LinkEntity | null> {
        return this.update(id, linkDataDto);
    }

    async softDeleteLink(id: string): Promise<boolean> {
        return this.delete(id);
    }

    async findLinksPaginated(
        number: number,
        limit: number,
        filter: Partial<LinkEntity>,
    ): Promise<{ data: LinkEntity[]; total: number; page: number; limit: number }> {
        return this.findPaginated(number, limit, filter);
    }
}
