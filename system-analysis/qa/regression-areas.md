# Regression Areas

Prioritize these after a change, subject to non-production test data and
authorization:

1. **Authentication/session:** LoanLeaf organization/user login, CiiHive
   client/user login, expiry/refresh, logout and session isolation.
2. **Customer identity/profile:** required identity fields, bilingual names,
   validation, duplicate handling, customer modification and authorization.
3. **Loan origination:** customer lookup, product/amount dependencies,
   schedule generation, application submission, workflow routing and queue
   visibility.
4. **Loan lifecycle:** review, inspection, collection/credit review, final
   decision, authorization, account opening, disbursement, repayment, closure,
   reversal and audit (only in controlled environments).
5. **Deposit and term deposit:** registration, approval, transactions, rates,
   charges, instruments and closure.
6. **Workflow/role security:** assigned queue, approve/reject permissions,
   user/role allocation and audit log.
7. **Cross-application data consistency:** verified shared IDs, customer
   fields, application/loan statuses, duplicate/idempotency handling and
   retries.
8. **Reports/inquiries:** criteria, sort, pagination, totals, empty/error
   states and access scoping.
9. **Localization/accessibility:** Arabic/English labels, RTL layout, keyboard
   access, required indicators and Playwright accessible selectors.
10. **Configuration and metadata:** form schema, data selects, linked
    dropdowns, workflow stages, `targetDB`, configured hooks and product rules.

No database mappings or expected statuses should be assumed until verified
against authorized schemas and workflow definitions.
