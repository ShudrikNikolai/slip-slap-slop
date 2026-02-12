module.exports = {
    ...require('../jest.config'),
    testRegex: '.e2e-spec\\.ts$',
    setupFilesAfterEnv: ['<rootDir>/test/setup/setup-e2e.ts'],
    globalSetup: '<rootDir>/test/setup/global-setup.ts',
    globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
    testTimeout: 30000, // 30 секунд для E2E тестов
};
