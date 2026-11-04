# API Communication Observations

## Hosts

| UI | Observed API host |
|---|---|
| LoanLeaf (`loanleaf.mfsys.com.pk`) | `ebdaa.mfsys.com.pk` |
| CiiHive (`ebdaa.mfsys.com.pk`) | `www.ebdaa.mfsys.com.pk` |

These are observed browser network destinations. Host-name similarity alone
does not establish that the UIs share a backend deployment.

At the time of investigation, the three UI/API hostnames resolved to at least
one common address. Shared DNS resolution is consistent with shared hosting or
a reverse proxy, but is not evidence that the same backend application or
database handles all requests.

## Authentication

Both apps issued initial API requests that returned HTTP 401 during the
observed session. Each then made a successful request to
`POST /security/auth/refreshtoken`, and later module requests returned HTTP
200. CiiHive's observed refresh request field names included `clientid`,
`username`, `password`, and `token`, with a `token` response field. LoanLeaf's
refresh request used a `data` envelope. No values were recorded.

## Representative module calls

- LoanLeaf: date/time lookup, loan SQL/Mongo selector, loan Mongo lazy-list,
  security selector, and translation calls.
- CiiHive: module menu, organization date, pending workflow report, Mongo
  metadata/workflow/lazy-list, SQL selectors, security user/role lookup, and
  translations.
- CiiHive's metadata response schema includes `formId`, `moduleId`,
  `controlTree`, `dataSelect`, button, workflow, linked-dropdown, API-hook, and
  constraint fields.
- The latest instrumented CiiHive authenticated-shell smoke also observed
  `POST /report/generate/pendingworkflow` returning HTTP 200 with a sanitized
  request/response shape and timing. This is a dashboard inquiry, not a
  business mutation.
- Both shell smoke reports observed a browser request to
  `maps.googleapis.com`. This confirms a browser-level external dependency
  only; it does not establish business-data exchange with another application.
- The customer registration and individual-loan create/authorization screens
  fetched metadata from `/crm/mongodb/metadata` and
  `/loan/mongodb/metadata`. The response declares workflow stages and hooks
  `CREATE_CUSTOMER_PROFILE`, `SAVE_WORKFLOW_NUMBER`, `UPDATE_LOAN_ACCOUNT`,
  and `OPEN_LOAN_ACCOUNT`; details are in the
  [CiiHive API inventory](../application-2/api-documentation.md).
- LoanLeaf's customer, loan, and inquiry routes emitted selector/lazy-list
  calls while opened. No save/create endpoint was observed in this read-only
  trace.

The per-application endpoint lists are in
[LoanLeaf API documentation](../application-1/api-documentation.md) and
[CiiHive API documentation](../application-2/api-documentation.md).

## Request/response handling limits

Earlier route-pass records retained endpoint paths, statuses, and field names.
The instrumented smoke reports retain request/response structure, elapsed
time, and safe header names while discarding all scalar payload/header values
and query values. No authorization tokens, customer records, or database
query values are documented. Calls that require submitting a form or
intentionally searching for a customer were not initiated.

## Credential-handling observation

The browser storage key list included a key named `password`, and CiiHive's
refresh request schema includes a `password` field name. Values were not
inspected or logged, so this does not establish whether the stored/requested
value is plaintext or otherwise protected. Treat this as a credential-handling
review item for the application owner, not a confirmed vulnerability.
