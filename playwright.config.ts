import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 3,
  retries: 0,
  timeout: 45_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4322',
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'wrangler dev --local --ip 127.0.0.1 --port 4322 --inspector-port 9232',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
