import { ConfigType, registerAs } from '@nestjs/config';
import { CONFIG_TOKENS } from '../constants/config-tokens.const';
import { getEnv, getEnvNumber } from '../utils/env.util';

export const AppConfig = registerAs(CONFIG_TOKENS.APP.CONFIG_NAME, () => ({
    name: getEnv(CONFIG_TOKENS.APP.NAME),
    port: getEnvNumber(CONFIG_TOKENS.APP.PORT),
    baseUrl: getEnv(CONFIG_TOKENS.APP.BASE_URL),
    version: getEnv(CONFIG_TOKENS.APP.GLOBAL_DEFAULT_API_VERSION),
    globalPrefix: getEnv(CONFIG_TOKENS.APP.GLOBAL_PREFIX),
    locale: getEnv(CONFIG_TOKENS.APP.LOCALE),
    nodeEnv: getEnv(CONFIG_TOKENS.APP.NODE_ENV),
    tz: getEnv(CONFIG_TOKENS.APP.TZ),
}));

export type TAppConfig = ConfigType<typeof AppConfig>;
