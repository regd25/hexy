/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'hexy/domain': '<rootDir>/src/domain/index.ts',
    'hexy/infrastructure': '<rootDir>/src/infrastructure/index.ts',
    'hexy/application': '<rootDir>/src/application/index.ts',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.interface.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  testMatch: ['**/*.spec.ts'],
  verbose: true,
};