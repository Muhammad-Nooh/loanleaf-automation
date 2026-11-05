import { Locator, Page } from '@playwright/test';
import * as path from 'path';

/** Small PDF used for every file upload in the flow. */
export const SAMPLE_PDF = path.resolve('fixtures', 'sample.pdf');

export const today = () => new Date().toISOString().slice(0, 10);

/** Case-insensitive whole-text match, for choosing one option out of similar ones. */
export const exact = (s: string) =>
  new RegExp(`^\\s*${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');

export type Pref = string | RegExp;

/**
 * Choose an option in an ng-select dropdown. `host` is the <ng-select> element
 * (e.g. '#PEPId'). Tries each preferred option in order, else takes the first one.
 */
export async function pick(page: Page, host: string | Locator, prefer: Pref[] = []) {
  const sel = typeof host === 'string' ? page.locator(host).first() : host.first();
  await sel.scrollIntoViewIfNeeded();
  await sel.locator('.ng-select-container').click();
  const options = page.locator('ng-dropdown-panel .ng-option:not(.ng-option-disabled)');
  await options.first().waitFor({ state: 'visible', timeout: 10_000 });
  for (const p of prefer) {
    const match = options.filter({ hasText: p });
    if (await match.count()) {
      await match.first().click();
      return;
    }
  }
  await options.first().click();
}

/** The ng-select that follows a label such as "Country" (labels carry a trailing "*"). */
export function selectByLabel(page: Page, label: string): Locator {
  return page.locator(`xpath=(//label[contains(normalize-space(.), "${label}")]/following::ng-select)[1]`);
}

/**
 * Fill every ng-select that is still marked invalid with its preferred or first
 * option. Handles dependent dropdowns (country, then governorate, then city)
 * because newly required ones are picked up on the next pass.
 */
export async function fillInvalidSelects(page: Page, prefer: Pref[] = [], max = 15) {
  for (let i = 0; i < max; i++) {
    const next = page.locator('ng-select.ng-invalid:visible').first();
    if (!(await next.count())) return;
    await pick(page, next, prefer);
    await page.waitForTimeout(300);
  }
}

export const textbox = (page: Page, name: string) => page.getByRole('textbox', { name });
export const spin = (page: Page, name: string) => page.getByRole('spinbutton', { name });

export async function fillIfPresent(loc: Locator, value: string) {
  if (await loc.count()) await loc.first().fill(value);
}

export async function proceed(page: Page) {
  await page.getByRole('button', { name: 'Proceed' }).click();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
}

/** Add a comment in the comments panel (used on every workflow screen). */
export async function addComment(page: Page, text: string) {
  await page.locator('#comments').getByRole('button').first().click();
  await textbox(page, 'Comments *').fill(text);
  await page.getByRole('button', { name: 'Add' }).click();
}
