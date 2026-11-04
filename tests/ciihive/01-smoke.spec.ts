import { test, expect } from '@playwright/test';
import { ciihive } from '../../src/core/env';

// Runs with the saved CiiHive session (see tests/setup/ciihive.setup.ts).
test('CiiHive: logged-in session reaches the app', async ({ page }) => {
  await page.goto(new URL('/', ciihive.url).toString());
  await expect(page).not.toHaveURL(/#\/login/);
});
