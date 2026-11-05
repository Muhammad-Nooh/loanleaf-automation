import { required } from '../core/env';

/** Loan inputs come from .env so they always match what the test system accepts. */
export const loanInputs = {
  /** Loan product exactly as it is shown in the English UI. */
  get product() { return required('LOAN_PRODUCT'); },
  get amount() { return Number(required('LOAN_AMOUNT')); },
  /** Amount to disburse in CiiHive; defaults to the loan amount. */
  get disbursementAmount() { return Number(process.env.DISBURSEMENT_AMOUNT ?? required('LOAN_AMOUNT')); },
};
