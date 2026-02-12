import { ConfigType, registerAs } from '@nestjs/config';
import { CONFIG_TOKENS } from '../constants/config-tokens.const';
import { getEnvBoolean, getEnvNumber } from '../utils/env.util';

export const CacheConfig = registerAs(CONFIG_TOKENS.CACHE.CONFIG_NAME, () => ({
    defaultTtl: getEnvNumber(CONFIG_TOKENS.CACHE.DEFAULT_TTL),
    maxItems: getEnvNumber(CONFIG_TOKENS.CACHE.MAX_ITEMS),
    enabled: getEnvBoolean(CONFIG_TOKENS.CACHE.ENABLED),
}));

export type TCacheConfig = ConfigType<typeof CacheConfig>;
