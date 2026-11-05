import { Page } from '@playwright/test';
import { LoanLeafCustomer } from '../../data/customer';
import {
  exact, fillIfPresent, fillInvalidSelects, pick, selectByLabel, spin, SAMPLE_PDF, textbox, today,
} from './ui';

const NO = exact('No');

/**
 * Customer Profile screen, from the recorded session. Fills the profile and
 * saves it; the app then asks whether to continue to the loan application and
 * we answer Yes, which leaves the browser on the loan application wizard.
 */
export async function createCustomerProfile(page: Page, c: LoanLeafCustomer) {
  await page.getByRole('link', { name: /Customer Profile/ }).click();

  // Identity
  await textbox(page, 'CPR No. *').fill(c.cpr);
  await pick(page, selectByLabel(page, 'Country'), [exact('Bahrain')]);
  await pick(page, selectByLabel(page, 'Nationality'), [exact('Bahrain')]);
  await page.locator('#expiryDate').first().fill(c.expiry);
  await textbox(page, 'Date Of Birth * Date Of Birth').fill(c.dob);
  await pick(page, selectByLabel(page, 'Gender'), ['Female']);
  await page.getByRole('button', { name: 'Upload Consent *' }).setInputFiles(SAMPLE_PDF);

  // Names, Arabic then English (the app accepted the same text in both)
  for (const lang of ['Ar', 'En']) {
    await textbox(page, `First Name (${lang}) *`).fill(c.first);
    await textbox(page, `Middle Name 1 (${lang}) *`).fill(c.middle1);
    await textbox(page, `Middle Name 2 (${lang}) *`).fill(c.middle2);
    await textbox(page, `Last Name (${lang}) *`).fill(c.last);
    await textbox(page, `Mother Name (${lang}) *`).fill(c.mother);
  }

  // Personal details
  await pick(page, '#CMP_SALUTATION', [/^\s*(ms|mrs|miss)\b/i]);
  await pick(page, '#maritalStatus');
  const dob = page.locator('#dateOfBirth');
  if ((await dob.count()) > 1) await dob.nth(1).fill(c.dob);
  await textbox(page, 'Place of Birth *').fill(c.placeOfBirth);
  await textbox(page, 'Email Id *').fill(c.email);
  await textbox(page, 'Phone No *').fill(c.phone);
  await spin(page, 'Number of Dependents *').fill('3');
  await pick(page, '#cmp_education');
  await pick(page, '#cmp_region');
  await pick(page, '#cmp_housingnature', [/0500/]);
  await pick(page, '#cmp_jobnature');
  await spin(page, 'Monthly Income *').fill('554');

  // Declarations
  for (const id of ['#PEPId', '#FATCADeclarationId', '#CRSDeclarationId', '#USCitizen', '#USTaxResident', '#bornInUS']) {
    await pick(page, id, [NO]);
  }
  await pick(page, '#employmentStatus', ['Retired']);
  await page.getByLabel('Account Opening Reason *').selectOption('startProject');
  await textbox(page, 'Occupation *').fill('Trader');
  await textbox(page, 'Name of Employer *').fill('Self');

  // The recording picked several unlabeled dropdowns here by "first invalid one"
  const prefer = [exact('Bahrain'), exact('Capital'), NO];
  await fillInvalidSelects(page, prefer);
  await textbox(page, 'Nature of Activity / Business').fill('Retail');
  await textbox(page, 'Reason for Opening Bank').fill('Business financing');
  await spin(page, 'Net Worth *').fill('5988');

  // Address
  await spin(page, 'Building Number *').fill('22');
  await spin(page, 'Block Number *').fill('22');
  await fillInvalidSelects(page, prefer);
  await fillIfPresent(page.getByRole('spinbutton', { name: 'Flat Number *' }), '22');
  await fillIfPresent(page.getByRole('spinbutton', { name: 'Road Number *' }), '22');
  await fillIfPresent(page.getByRole('textbox', { name: 'Issuance Date *' }), today());

  await saveAndContinue(page, prefer);
}

/** Save; if the app shows validation errors, fill what is missing and try again. */
async function saveAndContinue(page: Page, prefer: Parameters<typeof fillInvalidSelects>[1]) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole('button', { name: 'Save' }).click();
    const yes = page.getByRole('button', { name: 'Yes' });
    const asked = await yes.waitFor({ state: 'visible', timeout: 8000 }).then(() => true, () => false);
    if (asked) {
      await yes.click(); // "continue to the loan application?"
      return;
    }
    const close = page.getByRole('button', { name: '×' });
    if (await close.isVisible().catch(() => false)) await close.click();
    await fillInvalidSelects(page, prefer);
    await fillIfPresent(page.getByRole('textbox', { name: 'Issuance Date *' }), today());
  }
  throw new Error('Customer profile did not save: the form still shows validation errors (see the failure screenshot).');
}
