import type { GetLinkRequest, GetLinkResponse } from '@/grpc/link';
import { CurrentUser } from '@/modules/auth/decorators';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update.link.dto';
import { LinkEntity } from './entities/link.entity';
import { LinkService } from './link.service';

@ApiTags('Links')
@Controller('links')
export class LinksController {
    constructor(private readonly linkService: LinkService) {}

    @Get('all')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all links' })
    async getLinks(@Query('page') page: number, @Query('limit') limit: number, @Body() filter: Partial<LinkEntity>) {
        return this.linkService.getLinks(page, limit, filter);
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create link' })
    async createLink(@CurrentUser('id') userId: string, @Body() createLinkDto: CreateLinkDto) {
        return this.linkService.create(userId, createLinkDto);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current link' })
    async getLink(@Param('id') id: string) {
        return this.linkService.getLinkById(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current link' })
    async updateLink(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
        return this.linkService.update(id, updateLinkDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current link' })
    async deleteLink(@Param('id') id: string) {
        return this.linkService.delete(id);
    }

    @GrpcMethod('LinkService', 'GetLink')
    async GetLink(data: GetLinkRequest): Promise<GetLinkResponse> {
        try {
            console.log('LinkService >>>', data)
            const link = await this.linkService.findByShortCode(data.shortCode);

            if (!link) {
                throw new Error('Link not found');
            }

            const response: GetLinkResponse = {
                id: link.id,
                originalUrl: link.originalUrl,
                shortCode: link.shortCode,
                userId: link.userId,
            };

            return response;
        } catch (error) {
            throw error;
        }
    }
}
