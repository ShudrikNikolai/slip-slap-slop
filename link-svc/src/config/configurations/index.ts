import { AppConfig, TAppConfig } from './app.config';
import { AuthConfig, TAuthConfig } from './auth.config';
import { CacheConfig, TCacheConfig } from './cache.config';
import { DatabaseConfig, TDatabaseConfig } from './database.config';
import { GrpcConfig, TGrpcConfig } from './grpc.config';
import { RedisConfig, TRedisConfig } from './redis.config';
import { SwaggerConfig, TSwaggerConfig } from './swagger.config';

export { AppConfig, AuthConfig, CacheConfig, DatabaseConfig, GrpcConfig, RedisConfig, SwaggerConfig };

export type { TAppConfig, TAuthConfig, TCacheConfig, TDatabaseConfig, TGrpcConfig, TRedisConfig, TSwaggerConfig };

export const Configs = [AuthConfig, AppConfig, GrpcConfig, CacheConfig, DatabaseConfig, RedisConfig, SwaggerConfig];
