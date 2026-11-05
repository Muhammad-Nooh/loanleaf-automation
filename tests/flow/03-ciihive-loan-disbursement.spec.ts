import { test } from '@playwright/test';
import { loadChain, need, updateChain } from '../../src/core/chain';
import { ciihive } from '../../src/core/env';
import { WRITES_SKIP_MESSAGE, writesAllowed } from '../../src/core/guard';
import { switchToEnglish } from '../../src/core/language';
import { loanInputs } from '../../src/data/loan';
import { CiiHiveLoginPage } from '../../src/pages/ciihive/LoginPage';

test.skip(!writesAllowed(), WRITES_SKIP_MESSAGE);

// Waiting for the CiiHive recording. Change test.fixme to test once the
// recorded steps are pasted in.
test.fixme('CiiHive: Cash Transaction > Loan > Disbursement, save', async ({ page }) => {
  const chain = loadChain();
  const loan = need(chain.loan, 'loan');
  need(loan.approved, 'loan.approved');

  const login = new CiiHiveLoginPage(page);
  await login.open(ciihive.url);
  await switchToEnglish(page);
  await login.login(ciihive.clientId, ciihive.username, ciihive.password);

  // === PASTE RECORDED STEPS: menu Cash Transaction > Loan > Disbursement,
  //     add the loan account (see chain.loan.accountNo), enter
  //     loanInputs.disbursementAmount, click Save, read the transaction reference ===

  updateChain({ disbursement: { amount: loanInputs.disbursementAmount, saved: true /*, reference: read from screen */ } });
});
