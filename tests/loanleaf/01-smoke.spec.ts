import { test, expect } from '@playwright/test';
import { loanleaf } from '../../src/core/env';
import { NetworkObserver } from '../../src/core/network-observer';

// Runs with the saved LoanLeaf session (see tests/setup/loanleaf.setup.ts).
test('LoanLeaf: logged-in session reaches the app', async ({ page }, testInfo) => {
  const observer = new NetworkObserver(page, { application: 'loanleaf', module: 'Application Shell' });
  observer.start();
  await observer.withAction('open application shell', () =>
    page.goto(new URL('/', loanleaf.url).toString()));
  await expect(page).not.toHaveURL(/\/auth\/login/);
  await observer.attach(testInfo, 'loanleaf-api-observations.json');
});
