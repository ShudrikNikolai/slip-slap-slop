import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { LinkModule } from './modules/link/link.module';
import { UserModule } from './modules/user/user.module';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [ConfigModule, SharedModule, HealthModule, AuthModule, UserModule, LinkModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
