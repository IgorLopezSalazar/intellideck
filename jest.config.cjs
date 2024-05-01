/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  clearMocks: true,
  coverageReporters: ["lcov", "text-summary"],
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/"],
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {},
  verbose: true,
  testTimeout: 10000
};