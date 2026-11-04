import { expect, Page } from '@playwright/test';

export class LoanLeafLoginPage {
  constructor(private page: Page) {}

  private get orgCode() {
    return this.page.getByLabel(/organization|org|رقم المنظمة/i).first();
  }
  private get username() {
    return this.page.getByLabel(/user|رقم المستخدم/i).first();
  }
  private get password() {
    return this.page.getByLabel(/password|كلمة المرور/i).first();
  }
  private get submit() {
    return this.page
      .getByRole('button', { name: /log ?in|sign ?in|submit|تسجيل الدخول/i })
      .first();
  }

  async open(url: string) {
    await this.page.goto(url);
    await expect(this.orgCode).toBeVisible();
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
  }

  async login(orgCode: string, user: string, pass: string) {
    await this.orgCode.fill(orgCode);
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
    // Logged in once we have left the /auth/ routes.
    await expect(this.page).not.toHaveURL(/\/auth\/login/, { timeout: 30_000 });
  }
}
