import { ConfigType, registerAs } from '@nestjs/config';
import { CONFIG_TOKENS } from '../constants/config-tokens.const';
import { getEnv, getEnvBoolean } from '../utils/env.util';

export const SwaggerConfig = registerAs(CONFIG_TOKENS.SWAGGER.CONFIG_NAME, () => ({
    enable: getEnvBoolean(CONFIG_TOKENS.SWAGGER.ENABLE, false),
    path: getEnv(CONFIG_TOKENS.SWAGGER.PATH),
}));

export type TSwaggerConfig = ConfigType<typeof SwaggerConfig>;
