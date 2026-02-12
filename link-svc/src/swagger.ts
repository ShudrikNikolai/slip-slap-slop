import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BaseEntity } from './common/entities/base.entity';
import { ConfigService } from './config';

const setupSwagger = (app: INestApplication, config: ConfigService): void => {
    const { name, port, version } = config.app;
    const { enable, path } = config.swagger;

    if (!enable && config.isDev) {
        return;
    }

    const documentBuilder = new DocumentBuilder()
        .setTitle(name)
        .setDescription(`${name} API document`)
        .setVersion(version);

    const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
        ignoreGlobalPrefix: false,
        extraModels: [BaseEntity],
    });

    SwaggerModule.setup(path, app, document, {});

    const logger = new Logger('SwaggerModule');

    logger.log(`Document running on http://127.0.0.1:${port}/${path}`);
};

export default setupSwagger;
