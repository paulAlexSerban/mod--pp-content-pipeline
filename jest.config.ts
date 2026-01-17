import type { Config } from "@jest/types";

const baseConfig = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/dist/**",
    "!**/coverage/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};

const config: Config.InitialOptions = {
  projects: [
    {
      ...baseConfig,
      displayName: "unit",
      testMatch: ["**/__tests__/**/*.test.ts"],
      testPathIgnorePatterns: ["\\.integration\\.test\\.ts$"],
    },
    {
      ...baseConfig,
      displayName: "integration",
      testMatch: ["**/__tests__/**/*.integration.test.ts"],
    },
  ],
};

export default config;
