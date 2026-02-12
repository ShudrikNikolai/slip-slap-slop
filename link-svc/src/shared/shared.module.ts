import { Module } from '@nestjs/common';
import { RedisModule } from './cache/redis.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [DatabaseModule, RedisModule],
    exports: [DatabaseModule, RedisModule],
})
export class SharedModule {}
