# Cross-Application Integration Test Cases

**Execution status:** Not run. No verified handoff, matching record, or
non-production test fixture is available.

| ID | Workflow | Preconditions | Expected result | Evidence to capture |
|---|---|---|---|---|
| INT-REG-01 | Customer registration from LoanLeaf | Non-production, explicit write authorization, unique disposable identity | One customer is accepted or routed to the documented CiiHive stage | Initiating screen, API request/response shape, correlation ID, CiiHive status, persistence reference. |
| INT-REG-02 | Customer field synchronization | Approved test customer and confirmed shared identifiers | Only mapped fields transfer; transformations are deterministic | Sanitized before/after field names/types and source/target identifiers. |
| INT-LOAN-01 | Loan application creation | Existing authorized test customer, product, non-production | Loan application is created once and appears in configured review | Workflow reference, module/form IDs, status before/after, API result. |
| INT-LOAN-02 | Loan approval to account open | Distinct maker/checker identities and test application | Required approval completes before account opening | Approver role, configured workflow transition, account reference, audit trail. |
| INT-DISB-01 | Disbursement status | Authorized non-production account and payment simulator | Disbursement status follows documented response and is reconciled | Request correlation, response code, status transition, accounting evidence. |
| INT-FAIL-01 | API timeout/downstream error | Controlled non-production fault injection approved by owner | UI reports pending/failure accurately; retry does not duplicate | Error response, retry count, idempotency key, reconciliation record. |
| INT-FAIL-02 | Partial workflow failure | Controlled non-production test only | Partial state is explicit and recoverable; no success-shaped fallback | Workflow state, compensating action/retry, audit events. |
| INT-IDEM-01 | Duplicate request | Same approved non-production request/reference replayed by test harness | One business entity is persisted | Duplicate response and unique/correlation references. |
| INT-STATUS-01 | Status synchronization | Existing sanitized test reference in each system | Source and consumer statuses agree per documented mapping | Timestamped status snapshots and source-of-truth evidence. |

Do not execute any case against production without explicit, case-specific
authorization. Do not use manual API replay to create, approve, or disburse
records.
