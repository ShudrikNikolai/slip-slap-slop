import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from './config';
import { setupGrpcOptions } from './grpc-client.options';
import { JwtAuthGuard } from './modules/auth/guards';
import setupSwagger from './swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: config.app.version,
    });

    app.setGlobalPrefix(config.app.globalPrefix);
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    const reflector = app.get(Reflector);
    const jwtAuthGuard = new JwtAuthGuard(reflector);
    app.useGlobalGuards(jwtAuthGuard);

    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });

    setupSwagger(app, config);

    const optionsGrpc = setupGrpcOptions(config);
    app.connectMicroservice<MicroserviceOptions>(optionsGrpc);

    await app.startAllMicroservices();
    await app.listen(config.app.port);

    console.log(`HTTP server running on: ${await app.getUrl()}`);
    console.log(`gRPC server running on: ${config.grpc.port}`);
    console.log(`Server started on port: ${config.app.port}`);
}

bootstrap().catch((error) => {
    console.error(`Failed to start application: ${error}`);
    process.exit(1);
});
