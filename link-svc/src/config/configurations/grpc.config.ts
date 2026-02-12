import { ConfigType, registerAs } from '@nestjs/config';
import { CONFIG_TOKENS } from '../constants/config-tokens.const';
import { getEnv, getEnvNumber } from '../utils/env.util';

export const GrpcConfig = registerAs(CONFIG_TOKENS.GRPC.CONFIG_NAME, () => ({
    port: getEnvNumber(CONFIG_TOKENS.GRPC.PORT),
    host: getEnv(CONFIG_TOKENS.GRPC.HOST),
    maxSendMessageLength: getEnvNumber(CONFIG_TOKENS.GRPC.MAX_MESSAGE_SIZE),
    maxReceiveMessageLength: getEnvNumber(CONFIG_TOKENS.GRPC.MAX_MESSAGE_SIZE),
    keepaliveTimeMs: getEnvNumber(CONFIG_TOKENS.GRPC.KEEPALIVE_TIME_MS),
    keepaliveTimeoutMs: getEnvNumber(CONFIG_TOKENS.GRPC.KEEPALIVE_TIMEOUT_MS),
}));

export type TGrpcConfig = ConfigType<typeof GrpcConfig>;
