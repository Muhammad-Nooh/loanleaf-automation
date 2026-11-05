import { test } from '@playwright/test';
import { newChain, updateChain } from '../../src/core/chain';
import { WRITES_SKIP_MESSAGE, writesAllowed } from '../../src/core/guard';
import { newLoanLeafCustomer } from '../../src/data/customer';
import { loanInputs } from '../../src/data/loan';
import { createLoanApplication } from '../../src/flow/loanleaf/application';
import { createCustomerProfile } from '../../src/flow/loanleaf/customer';
import { loginLoanLeaf } from '../../src/flow/loanleaf/login';

test.skip(!writesAllowed(), WRITES_SKIP_MESSAGE);

// Saving the customer profile leads straight into the loan application
// wizard, so both happen in one browser session.
test('LoanLeaf: create customer and submit loan application', async ({ page }) => {
  newChain();
  const customer = newLoanLeafCustomer();

  await loginLoanLeaf(page);
  await createCustomerProfile(page, customer);
  updateChain({
    customer: { firstName: customer.first, lastName: customer.last, idNumber: customer.cpr },
  });

  await createLoanApplication(page);
  updateChain({ loan: { product: loanInputs.product, amount: loanInputs.amount } });
});
