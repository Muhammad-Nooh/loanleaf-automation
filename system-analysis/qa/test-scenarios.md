# Reusable QA Test Scenarios

These are test designs, not executed tests. Run business-write scenarios only
in a designated non-production environment with explicit authorization and
approved disposable data.

## Functional scenarios

| ID | Scenario | Preconditions | Expected result | Validation points |
|---|---|---|---|---|
| LL-F-01 | Authenticate to LoanLeaf | Valid test credentials and organization code | User reaches authenticated dashboard | URL leaves login route; expected menu renders; no secret values logged. |
| LL-F-02 | Customer form required fields | Non-production; approved disposable identity data | Required fields prevent progression/save when missing | UI validation message, focus, server response; verify no record created on invalid attempt. |
| LL-F-03 | Customer identity boundaries | Non-production test identities | Valid formats accepted; malformed/duplicate identity rejected per policy | Client and server validation; duplicate prevention; no PII in logs. |
| LL-F-04 | Loan schedule dependency | Non-production; approved product | Product selection enables applicable dependent terms; valid schedule is calculated | Control enablement, calculation response, rounding/date rules. |
| LL-F-05 | Loan application draft | Non-production; disposable customer | Draft is associated with correct customer and progresses to expected queue | UI confirmation, workflow reference, authorized API response and DB checks. |
| LL-F-06 | Loan inquiry filters | Approved non-sensitive test reference | Search returns only matching records and consistent pagination | Filter criteria, sorting, page boundaries, empty-result behavior. |
| CH-F-01 | Customer registration wizard | Non-production; approved test identity and role | Required steps validate and successful draft enters configured authorization stage | Step state, workflow ID/stage, no duplicate record on retry. |
| CH-F-02 | Customer authorization | Distinct authorized approver; pending test draft | Only authorized approver can complete the transition | Role denial for unauthorized user; audit trail and final stage. |
| CH-F-03 | Loan application / review | Approved customer/product and test role | Application reaches configured review queue | Workflow stage/ref, customer/product association, validation. |
| CH-F-04 | Loan authorization/account open | Authorized non-production approver | Account is opened only after required approvals | Account identifier, status, audit event, duplicate guard. |
| CH-F-05 | Inquiry and report behavior | Sanitized test records | Filters, sorting, pagination, and empty results behave consistently | Results and counts match authorized data source. |

## API scenarios

| ID | Scenario | Preconditions | Expected result | Validation points |
|---|---|---|---|---|
| API-01 | Expired session refresh | Test account/session in non-production | Refresh succeeds or user is redirected cleanly | One refresh path; no credentials/tokens in logs. |
| API-02 | Invalid/expired authorization | Non-production test token | Protected endpoint denies access | 401/403 behavior; UI has no success-shaped fallback. |
| API-03 | Metadata-driven form lookup | Known form IDs and read-only route | Correct module/form metadata is returned | `formId`, `moduleId`, workflow stages, field schema. |
| API-04 | Lookup/list filters | Sanitized test data | Filters and limits are honored | Request criteria and response shape; no cross-tenant leakage. |
| API-05 | Idempotent retry | Non-production and approved retry test | Duplicate request does not create duplicate business entity | Stable idempotency/reference behavior and audit records. |

## Database validation scenarios

These are conceptual checks only. Do not run until read-only access and schemas
are verified; no table, collection, or column names are assumed.

| ID | Scenario | Preconditions | Expected result | Validation points |
|---|---|---|---|---|
| DB-01 | Customer persistence | Approved test customer and verified schema | Exactly one customer entity matches approved test reference | Primary/unique identifier and sanitized status fields. |
| DB-02 | Loan-to-customer relation | Verified loan/customer schema | Loan points to the intended customer using declared key | FK/reference consistency and organization scope. |
| DB-03 | Workflow-stage consistency | Verified workflow schema | Stored stage agrees with UI/API for test reference | Stage, status, timestamp, workflow reference. |
| DB-04 | Cross-store consistency | Verified SQL/Mongo mappings | Related object references resolve and required fields agree | Field/type mapping, version/timestamps, no orphan. |

## Cross-application and negative scenarios

| ID | Scenario | Preconditions | Expected result | Validation points |
|---|---|---|---|---|
| INT-01 | LoanLeaf customer handoff | Non-production, approved test entity, trace enabled | One documented event/request creates or updates the expected CiiHive customer state | Shared ID, request/response, workflow stage, persistence evidence. |
| INT-02 | Loan application handoff | Linked approved customer and test loan application | CiiHive receives or exposes the corresponding application once | Correlation ID, application status, duplicate prevention. |
| INT-03 | Approval status sync | Test approval in non-production | Status propagates to the documented source/consumer | Before/after stage, event/response, retry behavior. |
| INT-04 | Downstream service unavailable | Controlled non-production fault | Failure is visible, retry policy is bounded, no partial success is reported | Error code, idempotency, audit, reconciliation. |
| NEG-01 | Duplicate customer identity | Disposable test identities | Duplicate follows explicit policy; no ambiguous duplicate entity | UI/API rejection, DB uniqueness/reference. |
| NEG-02 | Invalid role attempts approval | User without approver role | Operation is denied and audited | 403/validation, no state change. |
| NEG-03 | Invalid loan amount/date boundary | Documented product constraints | Invalid boundary is rejected consistently | Frontend and server response; no persistence. |
| NEG-04 | Cross-organization reference | Authorized non-production tenants | Foreign organization records are inaccessible | API authorization and database tenant predicate. |

Never use production personal data as a test fixture. Approval, disbursement,
reversal, and other financial actions require separate explicit authorization.
