module.exports = {
    // Корневая директория проекта
    rootDir: '.',

    // Расширения файлов для тестирования
    moduleFileExtensions: ['js', 'json', 'ts'],

    // Корневая директория для тестов
    roots: ['<rootDir>/src', '<rootDir>/test'],

    // Регулярное выражение для поиска тестовых файлов
    testRegex: '.*\\.spec\\.ts$',

    // Преобразование TypeScript файлов
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },

    // Директории для сбора покрытия
    collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/main.ts',
        '!src/**/*.module.ts',
        '!src/**/*.dto.ts',
        '!src/**/*.entity.ts',
        '!src/**/*.config.ts',
        '!src/**/index.ts',
        '!src/**/*.interface.ts',
    ],

    // Директория для отчетов покрытия
    coverageDirectory: './coverage',

    // Пороги покрытия (можно настроить под проект)
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },

    // Тестовое окружение
    testEnvironment: 'node',

    // Модули для трансформации
    transformIgnorePatterns: ['<rootDir>/node_modules/'],

    // Сопоставление путей (alias)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@test/(.*)$': '<rootDir>/test/$1',
    },

    // Дополнительные настройки ts-jest
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
            diagnostics: {
                warnOnly: true,
            },
        },
    },

    // Файлы для настройки перед тестами
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

    // Отчет о покрытии
    coverageReporters: ['text', 'lcov', 'html', 'json'],

    // Игнорируемые пути
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/coverage/',
    ],

    // Отслеживание изменений
    watchPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/coverage/',
    ],

    // Показывать уведомления
    notify: true,
    notifyMode: 'always',
};
