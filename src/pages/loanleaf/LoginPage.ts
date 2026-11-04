import { expect, Page } from '@playwright/test';

/**
 * LoanLeaf login. The locators below are first guesses (the page is a JS app
 * that could not be inspected up front). Refine them with:
 *   npm run codegen:loanleaf
 */
export class LoanLeafLoginPage {
  constructor(private page: Page) {}

  private get username() {
    return this.page
      .getByLabel(/user ?(name|id)|email|login/i)
      .or(this.page.locator('input[type="text"], input[type="email"]').first())
      .first();
  }
  private get password() { return this.page.locator('input[type="password"]').first(); }
  private get submit() {
    return this.page.getByRole('button', { name: /log ?in|sign ?in|submit/i }).first();
  }

  async open(url: string) {
    await this.page.goto(url);
    await expect(this.password).toBeVisible();
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
    // Logged in once we have left the /auth/ routes.
    await expect(this.page).not.toHaveURL(/\/auth\/login/, { timeout: 30_000 });
  }
}
