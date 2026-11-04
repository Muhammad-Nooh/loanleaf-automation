# LoanLeaf Business Workflow Observations

## Loan origination and servicing queue (menu-derived)

The visible menu suggests the following stage sequence:

```text
Customer Profile → Loan Application → Application Review
  → Assign Inspector → Second Visit
  → Credit Officer / Collection Review → Final Collection Review
  → Executive Loan Decision → Notify Customer
  → Promissory Note → Loan Authorization / Disbursement Review
```

On-hold and returned applications and an inspector-update screen are also
visible. This sequence is a navigation-based workflow hypothesis; transition
rules, required approvals, and actual status synchronization were not tested.

## Dashboard schedule helper

Observed controls suggest a schedule calculation based on product, amount,
annual interest, duration, frequency, disbursement date, and first-installment
date. Product and amount are marked required, and some dependent fields are
disabled before product selection. The calculation button was not activated.

## Customer registration

The Customer Profile route displays identity and bilingual profile fields.
Some labels are marked required. No customer data was entered or submitted;
the record lifecycle and relationship to CiiHive customer registration remain
unverified.

## Inquiry and administrative workflows

- Loan Inquiry provides search criteria and a results grid. No query was run.
- Permission Management exposes user/role allocation controls. No permissions
  were changed.
- Change Password exposes current/new/confirmation fields. No password was
  changed.

## Cross-application handoff

The project README describes an intended LoanLeaf customer/loan creation
followed by CiiHive verification/approval chain. That intent is consistent
with the visible LoanLeaf queues, but the record-level handoff and outcome
remain unverified. See the [integration notes](../integration/integration-flow.md).
