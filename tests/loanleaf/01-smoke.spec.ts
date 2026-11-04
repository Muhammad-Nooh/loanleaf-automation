import { test, expect } from '@playwright/test';
import { loanleaf } from '../../src/core/env';

// Runs with the saved LoanLeaf session (see tests/setup/loanleaf.setup.ts).
test('LoanLeaf: logged-in session reaches the app', async ({ page }) => {
  await page.goto(new URL('/', loanleaf.url).toString());
  await expect(page).not.toHaveURL(/\/auth\/login/);
});
