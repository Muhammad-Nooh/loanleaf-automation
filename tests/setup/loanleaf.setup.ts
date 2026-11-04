import { test as setup } from '@playwright/test';
import { AUTH_FILE, loanleaf } from '../../src/core/env';
import { LoanLeafLoginPage } from '../../src/pages/loanleaf/LoginPage';

setup('log in to LoanLeaf', async ({ page }) => {
  const login = new LoanLeafLoginPage(page);
  await login.open(loanleaf.url);
  await login.login(loanleaf.username, loanleaf.password);
  await page.context().storageState({ path: AUTH_FILE.loanleaf });
});
