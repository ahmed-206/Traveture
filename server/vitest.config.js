import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    threads: false,
    testTimeout: 15000,   
    hookTimeout: 15000
  },
});