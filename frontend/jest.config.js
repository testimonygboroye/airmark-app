/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true, tsconfig: "tsconfig.jest.json" }],
  },
  testMatch: ["**/src/tests/**/*.test.ts"],
  setupFilesAfterEach: [],
  setupFiles: [],
};
