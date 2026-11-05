import { Page } from '@playwright/test';
import { addComment, pick, proceed, SAMPLE_PDF } from './ui';

async function openStage(page: Page, link: string) {
  const item = page.getByRole('link', { name: link });
  if (!(await item.isVisible().catch(() => false))) {
    await page.getByRole('link', { name: /Pending Applications/ }).click();
  }
  await item.click();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
}

/** Open the customer's application from the queue (row found by CPR number). */
async function openApplication(page: Page, cpr: string) {
  const row = page.getByRole('row').filter({ hasText: cpr });
  if (await row.count()) await row.first().getByRole('button').first().click();
  else await page.getByRole('button', { name: 'View' }).first().click();
}

/** The pattern most queues share: open, Proceed, comment, Proceed, final button. */
async function reviewAndFinish(page: Page, cpr: string, link: string, finalButton: RegExp) {
  await openStage(page, link);
  await openApplication(page, cpr);
  await proceed(page);
  await addComment(page, `Auto: ${link}`);
  await proceed(page);
  await page.getByRole('button', { name: finalButton }).first().click();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
}

/**
 * Push the application through every LoanLeaf queue, in the recorded order.
 * The recorded session used one user for all stages.
 *
 * Stages marked UNCONFIRMED were only opened (not completed) in the recording;
 * they use the usual pattern and may need adjusting after a first run.
 */
export async function approveAllStages(page: Page, cpr: string) {
  await reviewAndFinish(page, cpr, 'Review Application', /^Submit$/);

  // UNCONFIRMED: choose an inspector, then open the row
  await openStage(page, 'Assign Inspector');
  await pick(page, page.locator('ng-select').first());
  await openApplication(page, cpr);

  // UNCONFIRMED: only opened in the recording
  await reviewAndFinish(page, cpr, 'Second Visit', /^(Submit|Approve)$/);

  await reviewAndFinish(page, cpr, 'Collection Review', /^Submit$/);
  await reviewAndFinish(page, cpr, 'Final Approval', /^Approve$/);

  // UNCONFIRMED: only opened in the recording
  await reviewAndFinish(page, cpr, 'Executive Approval', /^(Submit|Approve)$/);

  // Notify customer (recorded: View, edit the 5th row, Notify)
  await openStage(page, 'Notify Customer');
  await page.getByRole('button', { name: 'View' }).first().click();
  await page.getByRole('button').nth(5).click();
  await page.locator('tr:nth-child(5) > td:nth-child(3) > .form-control').fill('Auto notification');
  await page.getByRole('button', { name: 'Notify' }).click();

  // Promissory note (recorded: edit, attach file, Add)
  await openStage(page, 'Promissory Note');
  await page.getByRole('button', { name: '✏️' }).first().click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(SAMPLE_PDF);
  await page.getByRole('button', { name: 'Add' }).click();

  await reviewAndFinish(page, cpr, 'Disbursement Review', /^Submit$/);
}
