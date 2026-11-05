import { test } from '@playwright/test';
import { loadChain, need, updateChain } from '../../src/core/chain';
import { ciihive } from '../../src/core/env';
import { WRITES_SKIP_MESSAGE, writesAllowed } from '../../src/core/guard';
import { switchToEnglish } from '../../src/core/language';
import { CiiHiveLoginPage } from '../../src/pages/ciihive/LoginPage';

test.skip(!writesAllowed(), WRITES_SKIP_MESSAGE);

test.fixme('CiiHive: Authorization > Loan, authorize the disbursement', async ({ page }) => {
  const chain = loadChain();
  const disbursement = need(chain.disbursement, 'disbursement');
  need(disbursement.saved, 'disbursement.saved');

  const login = new CiiHiveLoginPage(page);
  await login.open(ciihive.url);
  await switchToEnglish(page);
  await login.login(ciihive.clientId, ciihive.username, ciihive.password);

  // === PASTE RECORDED STEPS: menu Authorization > Loan, find the disbursement
  //     (by loan account / amount / reference), authorize it ===

  updateChain({ disbursement: { ...disbursement, authorized: true } });
});
