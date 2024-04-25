/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ["lcov", "text-summary"],
  testResultsProcessor: "jest-sonar-reporter",
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
  testPathIgnorePatterns: ["/node_modules/"]
};