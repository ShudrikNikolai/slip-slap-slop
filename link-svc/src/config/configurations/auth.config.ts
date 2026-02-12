import { CONFIG_TOKENS } from '@/config/constants/config-tokens.const';
import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv, getEnvBoolean, getEnvNumber } from '../utils/env.util';

export const AuthConfig = registerAs(CONFIG_TOKENS.AUTH.CONFIG_NAME, () => ({
    jwtSecret: getEnv(CONFIG_TOKENS.AUTH.JWT_SECRET),
    jwtExpiration: getEnvNumber(CONFIG_TOKENS.AUTH.JWT_EXPIRATION, 84600),
    jwtRefreshSecret: getEnv(CONFIG_TOKENS.AUTH.JWT_REFRESH_SECRET),
    jwtRefreshExpiration: getEnv(CONFIG_TOKENS.AUTH.JWT_REFRESH_EXPIRATION),
    sessionSecret: getEnv(CONFIG_TOKENS.AUTH.SESSION_SECRET),
    sessionExpiration: getEnvNumber(CONFIG_TOKENS.AUTH.SESSION_EXPIRATION),
    sessionEnabled: getEnvBoolean(CONFIG_TOKENS.AUTH.SESSION_ENABLED),
}));

export type TAuthConfig = ConfigType<typeof AuthConfig>;
