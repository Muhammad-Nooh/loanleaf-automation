import { test as setup } from '@playwright/test';
import { AUTH_FILE, ciihive } from '../../src/core/env';
import { CiiHiveLoginPage } from '../../src/pages/ciihive/LoginPage';

setup('log in to CiiHive', async ({ page }) => {
  const login = new CiiHiveLoginPage(page);
  await login.open(ciihive.url);
  await login.login(ciihive.clientId, ciihive.username, ciihive.password);
  await page.context().storageState({ path: AUTH_FILE.ciihive });
});
