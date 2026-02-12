import { ConfigType, registerAs } from '@nestjs/config';
import { CONFIG_TOKENS } from '../constants/config-tokens.const';
import { getEnv, getEnvBoolean, getEnvNumber } from '../utils/env.util';

export const DatabaseConfig = registerAs(CONFIG_TOKENS.DB.CONFIG_NAME, () => ({
    type: getEnv(CONFIG_TOKENS.DB.TYPE) as any,
    host: getEnv(CONFIG_TOKENS.DB.HOST),
    port: getEnvNumber(CONFIG_TOKENS.DB.PORT),
    username: getEnv(CONFIG_TOKENS.DB.USERNAME),
    password: getEnv(CONFIG_TOKENS.DB.PASSWORD),
    database: getEnv(CONFIG_TOKENS.DB.DATABASE),

    // Автозагрузка сущностей
    autoLoadEntities: getEnvBoolean(CONFIG_TOKENS.DB.AUTO_LOAD_ENTITIES, true),

    // Явное указание путей
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    //
    // // Миграции
    // migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    // migrationsTableName: 'migrations',
    // migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
    // cli: {
    //     migrationsDir: 'src/migrations',
    // },

    // Настройки для разных окружений
    // synchronize: process.env.NODE_ENV === 'development',
    // logger: process.env.NODE_ENV === 'development',

    // Дополнительные настройки
    // maxQueryExecutionTime: 1000, // логирование медленных запросов

    // Pool настроек
    // extra: {
    //     connectionLimit: process.env.DB_CONNECTION_LIMIT
    //         ? parseInt(process.env.DB_CONNECTION_LIMIT, 10)
    //         : 10,
    // },
    //
    // // SSL для production
    // ssl: process.env.NODE_ENV === 'production'
    //     ? { rejectUnauthorized: false }
    //     : false,
}));

export type TDatabaseConfig = ConfigType<typeof DatabaseConfig>;
