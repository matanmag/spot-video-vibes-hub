export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {},
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.app.json'
    }
  }
};
