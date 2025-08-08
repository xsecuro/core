/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/specs'],
    testMatch: ['**/?(*.)+(spec).ts'],
    transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { verbatimModuleSyntax: false } }] },
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    collectCoverageFrom: ['src/**/*.ts'],
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', 'src/types/'],
    coverageReporters: ['text', 'lcov', 'html'],
}
