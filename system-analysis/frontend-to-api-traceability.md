# Frontend-to-API Traceability

This is a black-box trace from UI screens to requests observed during
authenticated, read-only browser navigation. It does not assert internal
backend processing.

| Application / screen | UI trigger or action | Observed API | Observable response | Classification / limits |
|---|---|---|---|---|
| LoanLeaf authenticated shell | Open application | Translation, timezone/company-date, selector and lazy-list calls | HTTP 200 after refresh; date/selector response field names recorded | Browser + response observation; exact call-to-control association was not retained for every request |
| LoanLeaf customer routes | Open route | Loan/security selector and lazy-list calls appeared during route navigation | Successful selector shape includes `controlId`, `options` | Route-level observation; no customer search or save performed |
| LoanLeaf loan routes | Open route | Loan selector/lazy-list calls appeared during route navigation | Successful selector shape includes `controlId`, `options` | Route-level observation; no application submission |
| CiiHive menu/shell | Open authenticated shell | `/security/menu/appmenu`, `/security/menu/menubar`, translations, date/time calls, and `POST /report/generate/pendingworkflow` | Current instrumented shell returned HTTP 200 for pending-workflow inquiry; request shape includes organization/location/login and assigned workflow/activity fields, response groups workflow counts by module | Browser + API response shape; all scalar values redacted |
| CiiHive CRM customer registration | Open customer form | `GET /crm/mongodb/metadata` with form/module context; CRM lookups/lists | Metadata includes form/workflow/control-tree fields and registration stage configuration | Verified through browser and API response; no submit or hook invocation |
| CiiHive customer authorization | Open authorization form | `GET /crm/mongodb/metadata` | Response declares `CREATE_CUSTOMER_PROFILE` at create | Configuration observation only; hook execution unknown |
| CiiHive individual loan creation | Open loan create form | `GET /loan/mongodb/metadata`; loan selectors/lists | Workflow and next-stage fields; hooks `SAVE_WORKFLOW_NUMBER` and `UPDATE_LOAN_ACCOUNT` declared | Configuration observation only; no create/update |
| CiiHive loan authorization | Open authorization form | `GET /loan/mongodb/metadata` | `OPEN_LOAN_ACCOUNT` at create and `UPDATE_LOAN_ACCOUNT` at update declared | Configuration observation only; no approval/account-open action |
| CiiHive pending workflow inquiry | Open queue/report | `POST /report/generate/pendingworkflow` | Response grouped by module; request field names recorded | Inquiry request observed; no report values retained |

## New Playwright observation report

The shell smoke tests capture current XHR/fetch calls and attach a sanitized
JSON report to the Playwright result. The report's action label is
`open application shell`. It records:

- host, method, normalized path, query parameter names;
- non-sensitive header names only (never header values);
- request/response JSON shape with scalar values replaced by type labels;
- HTTP status, elapsed time, and failed-request flag;
- action label and a maximum observation count.
- failed network requests include a sanitized browser error code where
  available; raw failure text is not retained.

The instrumented shell tests do not interact with business forms. Screen-level
traces can be added around read-only navigation with `NetworkObserver`.
`withAction` labels calls initiated during that operation and subsequent
responses until another labelled action begins, which captures delayed
follow-up requests without retaining request values.

## What this mapping does not prove

An API call triggered by opening a screen establishes a UI-to-endpoint
relationship, not service internals, persistence, or external communication.
Metadata hook names do not prove execution. No observed endpoint is asserted
to communicate with the other application absent request/response or database
correlation evidence.
