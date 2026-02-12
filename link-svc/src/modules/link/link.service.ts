import type { GetLinkResponse } from '@/grpc/link';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update.link.dto';
import { LinkEntity } from './entities/link.entity';
import { LinkRepository } from './repositories/link.repository';

@Injectable()
export class LinkService {
    constructor(private readonly linkRepository: LinkRepository) {}
    async getLinkById(id: string): Promise<LinkEntity | null> {
        return this.linkRepository.findById(id);
    }

    async create(userId: string, createLinkDto: CreateLinkDto): Promise<LinkEntity | null> {
        return this.linkRepository.createLink(userId, { ...createLinkDto, shortCode: uuidv4() });
    }

    async delete(id: string): Promise<boolean> {
        return this.linkRepository.softDeleteLink(id);
    }

    async update(id: string, updateLinkDto: UpdateLinkDto): Promise<LinkEntity | null> {
        return this.linkRepository.updateLink(id, updateLinkDto);
    }

    async getLinks(
        page: number,
        limit: number,
        filter: Partial<LinkEntity>,
    ): Promise<{ data: LinkEntity[]; total: number; page: number; limit: number }> {
        return this.linkRepository.findLinksPaginated(page, limit, filter);
    }

    async findByShortCode(shortCode: string): Promise<LinkEntity | null> {
        return this.linkRepository.findOne({ shortCode });
    }

    async GetLink(shortCode: string): Promise<GetLinkResponse | null> {
        return this.linkRepository.findOne({ shortCode });
    }
}
