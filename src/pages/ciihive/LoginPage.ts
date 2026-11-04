import { expect, Page } from '@playwright/test';

/**
 * CiiHive login (organization code + user id + password).
 * Locators are first guesses; refine them with: npm run codegen:ciihive
 */
export class CiiHiveLoginPage {
  constructor(private page: Page) {}

  private get clientId() {
    return this.page
      .getByLabel(/client|organi[sz]ation|org/i)
      .or(this.page.locator('input[type="text"]').nth(0))
      .first();
  }
  private get username() {
    return this.page
      .getByLabel(/user/i)
      .or(this.page.locator('input[type="text"]').nth(1))
      .first();
  }
  private get password() { return this.page.locator('input[type="password"]').first(); }
  private get submit() {
    return this.page.getByRole('button', { name: /log ?in|sign ?in|submit/i }).first();
  }

  async open(url: string) {
    await this.page.goto(url);
    await expect(this.password).toBeVisible({ timeout: 30_000 });
  }

  async login(clientId: string, user: string, pass: string) {
    await this.clientId.fill(clientId);
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
    // CiiHive uses hash routes: logged in once we leave #/login.
    await expect(this.page).not.toHaveURL(/#\/login/, { timeout: 30_000 });
  }
}
