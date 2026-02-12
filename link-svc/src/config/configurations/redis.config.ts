import { ConfigType, registerAs } from '@nestjs/config';
import { CONFIG_TOKENS } from '../constants/config-tokens.const';
import { getEnv, getEnvNumber } from '../utils/env.util';

export const RedisConfig = registerAs(CONFIG_TOKENS.REDIS.CONFIG_NAME, () => ({
    host: getEnv(CONFIG_TOKENS.REDIS.HOST),
    port: getEnvNumber(CONFIG_TOKENS.REDIS.PORT),
    password: getEnv(CONFIG_TOKENS.REDIS.PASSWORD),
    db: getEnvNumber(CONFIG_TOKENS.REDIS.DB),
    keyPrefix: getEnv(CONFIG_TOKENS.REDIS.KEY_PREFIX),
    //
    // // Connection settings
    // retryStrategy: (times: number) => {
    //     const delay = Math.min(times * 50, 2000);
    //     return delay;
    // },
    //
    // // Sentinel
    // sentinels: process.env.REDIS_SENTINELS
    //     ? JSON.parse(process.env.REDIS_SENTINELS)
    //     : undefined,
    // sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD,
    // name: process.env.REDIS_SENTINEL_NAME || '',
    //
    // // Cluster
    // clusterNodes: process.env.REDIS_CLUSTER_NODES
    //     ? JSON.parse(process.env.REDIS_CLUSTER_NODES)
    //     : undefined,
}));

export type TRedisConfig = ConfigType<typeof RedisConfig>;
