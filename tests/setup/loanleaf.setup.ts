import { test as setup } from '@playwright/test';
import { AUTH_FILE, loanleaf } from '../../src/core/env';
import { LoanLeafLoginPage } from '../../src/pages/loanleaf/LoginPage';
import { saveRunTestResult } from '../qa/reporting';

setup('log in to LoanLeaf', async ({ page }) => {
  let outcome: 'passed' | 'failed' = 'failed';
  try {
    const login = new LoanLeafLoginPage(page);
    await login.open(loanleaf.url);
    await login.login(loanleaf.orgCode, loanleaf.username, loanleaf.password);
    await page.context().storageState({ path: AUTH_FILE.loanleaf });
    outcome = 'passed';
  } finally {
    await saveRunTestResult('loanleaf', 'Authentication', 'Login setup', outcome);
  }
});
