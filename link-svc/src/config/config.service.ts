import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
    TAppConfig,
    TAuthConfig,
    TCacheConfig,
    TDatabaseConfig,
    TGrpcConfig,
    TRedisConfig,
    TSwaggerConfig,
} from './configurations';
import { FLAT_CONFIG_TOKENS } from './constants/config-tokens.const';

type ConfigMap = {
    [FLAT_CONFIG_TOKENS.APP.CONFIG_NAME]: TAppConfig;
    [FLAT_CONFIG_TOKENS.DATABASE.CONFIG_NAME]: TDatabaseConfig;
    [FLAT_CONFIG_TOKENS.REDIS.CONFIG_NAME]: TRedisConfig;
    [FLAT_CONFIG_TOKENS.SWAGGER.CONFIG_NAME]: TSwaggerConfig;
    [FLAT_CONFIG_TOKENS.CACHE.CONFIG_NAME]: TCacheConfig;
    [FLAT_CONFIG_TOKENS.AUTH.CONFIG_NAME]: TAuthConfig;
    [FLAT_CONFIG_TOKENS.GRPC.CONFIG_NAME]: TGrpcConfig;
};

@Injectable()
export class ConfigService {
    constructor(private readonly configService: NestConfigService) {}

    get app(): TAppConfig {
        return this.get(FLAT_CONFIG_TOKENS.APP.CONFIG_NAME);
    }

    get database(): TDatabaseConfig {
        return this.get(FLAT_CONFIG_TOKENS.DATABASE.CONFIG_NAME);
    }

    get redis(): TRedisConfig {
        return this.get(FLAT_CONFIG_TOKENS.REDIS.CONFIG_NAME);
    }

    get cache(): TCacheConfig {
        return this.get(FLAT_CONFIG_TOKENS.CACHE.CONFIG_NAME);
    }

    get swagger(): TSwaggerConfig {
        return this.get(FLAT_CONFIG_TOKENS.SWAGGER.CONFIG_NAME);
    }

    get auth(): TAuthConfig {
        return this.get(FLAT_CONFIG_TOKENS.AUTH.CONFIG_NAME);
    }

    get grpc(): TGrpcConfig {
        return this.get(FLAT_CONFIG_TOKENS.GRPC.CONFIG_NAME);
    }

    get isDev(): boolean {
        return !(this.app.nodeEnv === 'production');
    }

    get<K extends keyof ConfigMap>(key: K): ConfigMap[K] {
        return this.configService.getOrThrow(key);
    }
}
