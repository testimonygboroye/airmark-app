/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  testTimeout: 30000,
  verbose: true,
  retry: 2,
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
};
