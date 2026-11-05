import { Page } from '@playwright/test';

/**
 * Switch an app's login page to English before doing anything else, so all
 * labels match the English text in the specs.
 *
 * FIRST GUESS: handles a <select> language list or an "English"/"EN" control.
 * Replace the body with the exact selector from the recording once we have it.
 */
export async function switchToEnglish(page: Page) {
  const select = page
    .locator('select')
    .filter({ has: page.locator('option', { hasText: /english/i }) })
    .first();
  if (await select.count()) {
    const label = (await select.locator('option', { hasText: /english/i }).first().textContent())?.trim();
    if (label) await select.selectOption({ label });
    return;
  }
  const control = page
    .getByRole('button', { name: /^(english|en)$/i })
    .or(page.getByRole('link', { name: /^(english|en)$/i }))
    .or(page.getByText(/^(english|en)$/i))
    .first();
  if (await control.isVisible().catch(() => false)) {
    await control.click();
    await page.waitForTimeout(500);
  } else {
    console.warn('switchToEnglish: no language control found; continuing in the current language.');
  }
}
