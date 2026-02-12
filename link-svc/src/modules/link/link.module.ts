import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkEntity } from './entities/link.entity';
import { LinksController } from './link.controller';
import { LinkService } from './link.service';
import { LinkRepository } from './repositories/link.repository';

@Module({
    imports: [TypeOrmModule.forFeature([LinkEntity])],
    controllers: [LinksController],
    providers: [LinkService, LinkRepository],
    exports: [LinkService, LinkRepository],
})
export class LinkModule {}
