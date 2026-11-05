import { test } from '@playwright/test';
import { loadChain, need, updateChain } from '../../src/core/chain';
import { WRITES_SKIP_MESSAGE, writesAllowed } from '../../src/core/guard';
import { approveAllStages } from '../../src/flow/loanleaf/approvals';
import { loginLoanLeaf } from '../../src/flow/loanleaf/login';

test.skip(!writesAllowed(), WRITES_SKIP_MESSAGE);

test('LoanLeaf: approve the loan through every stage', async ({ page }) => {
  const chain = loadChain();
  const cpr = need(chain.customer?.idNumber, 'customer.idNumber');
  const loan = need(chain.loan, 'loan');

  await loginLoanLeaf(page);
  await approveAllStages(page, cpr);

  updateChain({ loan: { ...loan, approved: true } });
});
