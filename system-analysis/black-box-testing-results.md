# Black-Box Testing Results

## Completed evidence

| Activity | Result | Evidence classification | Data impact |
|---|---|---|---|
| Authenticated route exploration | 19 visible LoanLeaf routes and 177 visible CiiHive route targets were navigated in prior sessions | Verified through browser observation | No business forms submitted |
| Read-only form inspection | Representative CRM customer and individual-loan screens and metadata inspected | Browser observation + API responses | No fields advanced/submitted |
| API response status observation | Earlier route passes recorded LoanLeaf 244 HTTP 200 / 10 HTTP 401 and CiiHive 549 HTTP 200 / 8 HTTP 401; refresh requests succeeded | Browser/API response observation | Values and tokens not retained |
| Workflow metadata inspection | Customer/loan stages and four configured hook names recorded | Verified through API responses (configuration only) | Hooks not executed |
| Instrumented LoanLeaf shell smoke | Passed; sanitized XHR/fetch report attached to Playwright report, including API host translation request and observed browser network dependencies | Verified through browser observation and API responses | Values, query values, and header values redacted |
| Instrumented CiiHive shell smoke | Passed; sanitized report includes `POST /report/generate/pendingworkflow` returning HTTP 200, with request/response field shapes and elapsed time | Verified through browser observation and API response | Workflow result values and identifying values redacted |
| Database access | No authentication or enumeration | Unknown / blocked | No database queries |
| Cross-application record comparison | Not performed; no approved sanitized correlated record available | Unknown due to lack of access | No record values read |

## Automated observation framework

The LoanLeaf and CiiHive shell smoke tests now attach sanitized network
observations to the Playwright report. The observer retains only endpoint
metadata, safe header names, payload shapes, status, timing, and action label.
It discards scalar payload values and all header values, and omits query
parameter values. This protects session credentials and business data while
preserving API structure.

The attached artifacts are generated at test runtime and are not source
documentation. Both setup/login flows and both shell smoke tests passed in the
latest run (4 tests total). The tests cover the authenticated shell only; they do not
replay, create, update, approve, disburse, or delete business records.

## Not executed

- Field validation, wizard progression, saves, approvals, or loan/account
  operations.
- Negative API payload tests or request replay.
- Database checks or SQL/Mongo cross-store comparisons.
- Cross-application synchronization, duplicate handling, retry, or failure
  injection.
- Role/permission matrix tests.

These require a designated non-production environment and explicit
authorization for any state-changing scenario. See [reusable QA scenarios](./qa/test-scenarios.md).

The run generated both report attachments with no dropped observations. A
sample was reviewed to confirm header values, query values, and payload scalar
values were omitted. The CiiHive report contained a successful pending-workflow
inquiry; this is a read-only dashboard request and did not modify business data.

## Phase 9 recheck execution

The latest `npm run qa -- --scope integration` run completed **21/21 tests**
(two login/setup checks and 19 registered module/screen checks) with no
failures. It generated 19 text-masked screenshots and 379 sanitized API
observations. The run observed no request to the other application's known
API host. That means no cross-app browser request was observed in this run; it
does not prove that no integration exists.

The run reported 18 API and 19 UI candidates because neither initial baseline
is approved. It reported zero potential regressions **against approved
baselines**; without approved baselines, this is not a regression-free
certification. Two CiiHive modules used shell-only checks because their exact
screen routes are not mapped. See the [historical run report](./reports/2026/11/2026-11-04T09-10-06-295Z-22444/report.json)
and [recheck engine guide](./qa/recheck-engine.md).
