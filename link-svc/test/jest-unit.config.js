module.exports = {
    ...require('../jest.config'),
    testRegex: '.*\\.unit\\.spec\\.ts$',
    setupFilesAfterEnv: ['<rootDir>/test/setup/setup-unit.ts'],
    testTimeout: 10000, // 10 секунд
};
