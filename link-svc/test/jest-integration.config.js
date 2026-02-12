module.exports = {
    ...require('../jest.config'),
    testRegex: '.*\\.integration\\.spec\\.ts$',
    setupFilesAfterEnv: ['<rootDir>/test/setup/setup-integration.ts'],
    testTimeout: 20000, // 20 секунд
};
