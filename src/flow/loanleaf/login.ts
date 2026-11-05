import { expect, Page } from '@playwright/test';
import { loanleaf } from '../../core/env';

/** Log in to LoanLeaf in English (locators taken from the recorded session). */
export async function loginLoanLeaf(page: Page) {
  await page.goto(loanleaf.url);
  await page.getByRole('combobox').first().selectOption('en');
  await page.getByRole('textbox', { name: 'Organization ID' }).fill(loanleaf.orgCode);
  await page.getByRole('textbox', { name: 'User ID' }).fill(loanleaf.username);
  const password = page.getByRole('textbox', { name: 'Password' });
  await password.fill(loanleaf.password);
  await password.press('Enter');
  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 30_000 });
  await expect(page.getByRole('link', { name: /Customer Profile/ })).toBeVisible({ timeout: 30_000 });
}
