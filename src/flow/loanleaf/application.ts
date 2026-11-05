import { Page } from '@playwright/test';
import { loanInputs } from '../../data/loan';
import {
  addComment, exact, fillInvalidSelects, pick, proceed, SAMPLE_PDF, spin, textbox, today,
} from './ui';

/**
 * Loan application wizard, from the recorded session. Starts on the page the
 * customer-profile "Yes" leads to and ends after Submit.
 */
export async function createLoanApplication(page: Page) {
  // Purpose and guarantees
  await page.locator('#PPO_MAINPURPOSE').waitFor({ timeout: 30_000 });
  await pick(page, '#PPO_MAINPURPOSE', ['Commercial']);
  await pick(page, '#PPO_GRPPURPOSE', [exact('Services')]);
  await pick(page, '#mbmBkmsobjective', [/Purchasing Goods for an/i]);
  await pick(page, '#PFS_FUSOID', [/AGFUND \(EBDAA Bahrain\)/i]);
  await pick(page, '#mbmBkmsguarantee', ['Executive Bond']);
  await pick(page, '#additionalLoanGuarantee', ['Cheques']);

  // Product, amount, schedule
  await pick(page, '#DMP_PRODCODE', [loanInputs.product]);
  await pick(page, '#BLA_LNAPPLIEDAMOUNTFC_FIXED', [exact(String(loanInputs.amount))]);
  await textbox(page, 'Expected Disbursement Date *').fill(today());
  await page.getByRole('button', { name: 'Generate Schedule' }).click();
  await page.getByRole('button', { name: 'Notify' }).click();
  await textbox(page, 'Invoice/Ref No. *').fill('333');
  await page.getByRole('button', { name: 'Post' }).click();

  // Supporting document (the recording opened the add-document dialog with an icon button)
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
  await pick(page, '#PDT_DOTYCODE', ['Bank Account Statement']);
  await textbox(page, 'Document Description *').fill('Bank statement');
  await textbox(page, 'Issuance Date *').fill(today());
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(SAMPLE_PDF);
  await page.getByRole('button', { name: 'Add' }).click();
  await proceed(page);

  // Disbursement details (region etc.)
  await fillInvalidSelects(page, [exact('Al-Bidaa')]);
  await proceed(page);

  // Income and obligations
  await pick(page, '#paymentMethodDropdown', ['Cash']);
  await pick(page, '#monthlyIncomeDropdown', [/-500/]);
  await pick(page, '#numberOfRelativesLoansDropdown', ['No Relatives']);
  await pick(page, '#numberOfDefaultingRelativesDropdown', [exact('2')]);
  await page.locator('#relativesTotalDelayDaysValue').fill('0');
  await page.locator('#grossIncomeAmtValue').fill('3434');
  await page.locator('#monthlyInstBenefitAmtValue').fill('333');
  for (const id of ['#currentLoansOtherDropdown', '#currentCardsOtherDropdown', '#previousLoansOtherDropdown', '#previousCardsOtherDropdown']) {
    await pick(page, id, [exact('0')]);
  }
  await page.getByRole('button', { name: 'Calculate' }).click();
  await proceed(page);

  // Project details
  await pick(page, '#sourceOfAwareness');
  await textbox(page, 'Project Name *').fill('Auto test project');
  await textbox(page, 'Nature of the product *').fill('Goods');
  await page.getByLabel('Is the project licensed? *').selectOption('yes');
  for (const id of ['#projectSector', '#siteNature', '#regionNature', '#project', '#projectType']) await pick(page, id);
  await spin(page, 'The year the project was').fill('33');
  await spin(page, 'Number of partners *').fill('1');
  await spin(page, 'Number of Male employees *').fill('3');
  await spin(page, 'Number of Female employees *').fill('3');
  await pick(page, '#projectSize', ['Medium']);
  for (const id of ['#goodsDemand', '#goodsQuality', '#projectClients']) await pick(page, id);
  await page.getByLabel('Cash purchase method *').selectOption('buyingCashpercentage');
  await spin(page, 'Purchase Value % *').fill('33');
  await page.getByLabel('Method of sale *').selectOption('sellingCashpercentage');
  await spin(page, 'Selling Value % *').fill('33');
  await spin(page, 'Maximum site sales *').fill('33');
  await spin(page, 'Minimum site sales *').fill('33');

  // First visit
  await pick(page, '#firstVisitSite', ['The Home']);
  await textbox(page, 'Date of first visit *').fill(today());
  await textbox(page, 'Visiting time *').fill('02:40');
  await page.getByLabel('Have you seen the merchandise').selectOption('no');
  await textbox(page, 'Reason *').fill('Not available');
  await textbox(page, 'Other Notes *').fill('None');
  await page.getByLabel("Is the client's house big or").selectOption('big');
  await pick(page, '#natureClientResidentialArea', ['Village']);
  await page.getByLabel('Does the client know his').selectOption('no');
  await page.getByLabel("Is the client's project").selectOption('new');
  await page.getByLabel('Did he have any customers').selectOption('yes');
  await page.getByLabel('Is the project micro or small').selectOption('small');
  await page.getByLabel('Is there an activity similar').selectOption('yes');
  await pick(page, '#ProjectAreaNature', ['Village']);
  await page.getByLabel('Were there any signs of').selectOption('no');
  await page.locator('#dsr').nth(1).fill('0');
  await proceed(page);

  // Comment, review, submit
  await addComment(page, 'Auto test comment');
  await proceed(page);
  await proceed(page);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'No', exact: true }).click(); // dialog after Submit
}
