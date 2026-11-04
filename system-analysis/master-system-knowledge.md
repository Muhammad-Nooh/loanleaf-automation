# Master System Knowledge (Evidence-Bounded)

## Systems

- **LoanLeaf:** Customer/loan portal at `loanleaf.mfsys.com.pk`. Its visible
  authenticated menu has 19 distinct route targets, including customer
  profile, loan application, review queues, loan inquiry, permissions, and
  settings.
- **CiiHive:** Financial application at `ebdaa.mfsys.com.pk`. Its visible
  authenticated menu has 177 distinct route targets across Designer, CRM,
  Loan, Deposit, Term Deposit, General Ledger, Security, Configuration, and
  other operational modules.
- The Playwright project has a separate saved browser state per app. Login
  setup succeeds for both. LoanLeaf authentication was updated to supply the
  organization code, user number, and password and to recognize Arabic labels.

## Verified API observations

- LoanLeaf UI calls APIs on `ebdaa.mfsys.com.pk`; CiiHive UI calls APIs on
  `www.ebdaa.mfsys.com.pk`.
- Both apps use a refresh-token flow. Initial 401s were followed by a
  successful refresh and later 200 responses during the route passes.
- CiiHive exposes metadata-driven form/workflow APIs plus lazy-list/select
  APIs. Field names and endpoints are documented separately; values are not.
- CiiHive metadata fetched through normal UI navigation for
  `BN_WF_CP_REGISTRATION` declares `targetDB: no_sql`, workflow
  `BN_WF_CP_CUSTOMERPROFILE`, and next stage `BN_WF_CP_AUTHORIZATION`. Its
  authorization form declares the `CREATE_CUSTOMER_PROFILE` hook.
- CiiHive metadata for `BN_WF_IL_CREATELOAN` declares workflow
  `BN_WF_IL_INDIVIDUALLOAN`, next stage `BN_WF_IL_LOANREVIEW`, and configured
  `SAVE_WORKFLOW_NUMBER`/`UPDATE_LOAN_ACCOUNT` hooks. The authorization form
  declares `OPEN_LOAN_ACCOUNT` and `UPDATE_LOAN_ACCOUNT`.
- These are configured hook names and workflow metadata, not proof the hooks
  executed or identification of their backend implementation or persistence
  objects.

## Business-flow interpretation

LoanLeaf's visible customer/loan workflow and CiiHive's CRM/loan approval
menus are consistent with the integration chain described in the project
README. The actual handoff, status synchronization, shared database, and
source-of-truth rules are not verified.

The observed UI/API host relationship and declarative form workflow metadata
are recorded in [end-to-end-data-flow.md](./integration/end-to-end-data-flow.md).
They strengthen evidence for CiiHive's configured workflow but do not
establish that a LoanLeaf record is synchronized to CiiHive.

## Black-box investigation approach

Backend source code is unavailable and is not required for this investigation.
The framework uses authenticated browser navigation, Playwright XHR/fetch
observation, API responses, and authorized read-only database evidence when
credentials become available. New shell smoke reports retain endpoint,
payload-shape, status, timing, and action metadata while discarding scalar
payload/header values and query values.

Findings are classified as verified through browser observation, verified
through API responses, verified through database records, inferred but not
verified, or unknown due to lack of access. See the [API behavior
mapping](./api-behavior-mapping.md), [frontend-to-API
traceability](./frontend-to-api-traceability.md), and [observed integration
flows](./observed-integration-flows.md).

## Database and traceability status

The database host ports were reachable, but no database authentication or
enumeration was performed. The supplied MySQL account is administrative and
was not used; the MongoDB account has not been verified read-only. SQL tables,
MongoDB collections, service implementation, and cross-app record identifiers
remain unknown. See the [database access status](./database/README.md),
[database mapping](./database/database-mapping.md), and
[database/API field mapping](./database-api-field-mapping.md).

## QA readiness

Reusable non-production-only scenarios are in
[test-scenarios.md](./qa/test-scenarios.md) and
[integration-test-cases.md](./qa/integration-test-cases.md). They have not
been executed against live business operations.

The Phase 9 [intelligent recheck engine](./qa/recheck-engine.md) provides
module dependency selection, sanitized API/UI observations, historical
reports, and baseline comparisons. The registry links only evidence-backed
routes/APIs/workflows/tests. LoanLeaf's mapped routes can be opened
read-only; CiiHive module form routes remain blocked where exact route
parameters are unavailable. Both application baseline files remain
unapproved; candidate snapshots are never automatically promoted.

## Safety and confidence

No live business record was changed. No form was submitted or approval,
authorization, reversal, or deletion action performed. Screenshots mask inputs
and data grids. Database discovery is blocked pending dedicated read-only
accounts and VPN/TLS confirmation.

See the [progress tracker](./progress.md) for blockers and
[README](./README.md) for the documentation index.
