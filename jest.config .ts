// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
    transform: {
        "^.+\\.tsx?$": "ts-jest", //CHANGE THIS BACK
        ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css"
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

export default config;