import { test as setup } from '@playwright/test';
import { AUTH_FILE, ciihive } from '../../src/core/env';
import { CiiHiveLoginPage } from '../../src/pages/ciihive/LoginPage';
import { saveRunTestResult } from '../qa/reporting';

setup('log in to CiiHive', async ({ page }) => {
  let outcome: 'passed' | 'failed' = 'failed';
  try {
    const login = new CiiHiveLoginPage(page);
    await login.open(ciihive.url);
    await login.login(ciihive.clientId, ciihive.username, ciihive.password);
    await page.context().storageState({ path: AUTH_FILE.ciihive });
    outcome = 'passed';
  } finally {
    await saveRunTestResult('ciihive', 'Authentication', 'Login setup', outcome);
  }
});
