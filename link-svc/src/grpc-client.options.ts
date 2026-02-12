import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from './config';

export const setupGrpcOptions = (config: ConfigService): MicroserviceOptions => {
    const cfgGrpc = config.grpc;
    return {
        transport: Transport.GRPC,
        options: {
            package: ['link'],
            protoPath: [join(__dirname, '../proto/link.proto')],
            url: `${cfgGrpc.host}:${cfgGrpc.port}`,
            maxSendMessageLength: cfgGrpc.maxSendMessageLength,
            maxReceiveMessageLength: cfgGrpc.maxSendMessageLength,
            keepalive: {
                keepaliveTimeMs: cfgGrpc.keepaliveTimeMs,
                keepaliveTimeoutMs: cfgGrpc.keepaliveTimeoutMs,
            },
        },
    };
};
