module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/tests/puppeteer/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/puppeteer/setup.js'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/tests/puppeteer/global-setup.js',
  globalTeardown: '<rootDir>/tests/puppeteer/global-teardown.js',
  collectCoverage: false,
  verbose: true
};