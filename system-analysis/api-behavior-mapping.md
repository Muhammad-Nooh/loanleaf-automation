# API Behavior Mapping (Black-Box)

## Evidence labels

- **Verified through browser observation:** a UI navigation or action triggered
  the request in an authenticated browser session.
- **Verified through API response:** an observed response returned the stated
  status or schema/configuration fields.
- **Verified through database records:** not established; read-only database
  access is pending.
- **Inferred but not verified:** a cautious interpretation of observed
  configuration or endpoint naming.
- **Unknown due to lack of access:** no observation supports a conclusion.

## Recorded request families

| Application | API family | Representative endpoint | Request / response evidence | Classification |
|---|---|---|---|---|
| LoanLeaf | Authentication | `POST /security/auth/refreshtoken` | Request has a `data` envelope; refresh succeeded during route exploration. Values and tokens were not retained. | Browser observation + API status |
| LoanLeaf | Organization date/time | `GET /configuration/organizations/timezone`; `GET /{module}/organizations/{orgId}/dailyoperations/companydate` | Successful responses exposed timezone/date and module keys. | Browser observation + response field names |
| LoanLeaf | Selectors | `POST /loan/sqldb/select`, `/loan/mongodb/select`, `/security/mongodb/select` | Request has a `data` envelope; response keys include `controlId`, `options`. | Browser observation + response schema |
| LoanLeaf | Lazy lists | `POST /loan/mongodb/lazylist` | Request has a `data` envelope; response values were not retained. | Browser observation |
| CiiHive | Session/menu | `POST /security/auth/refreshtoken`; `GET /security/menu/appmenu`, `/security/menu/menubar` | Menu data loaded after refresh; `moduleItems` appeared in the app-menu response. | Browser observation + response field names |
| CiiHive | Dashboard workflow inquiry | `POST /report/generate/pendingworkflow` | Seen on the current authenticated-shell smoke run; HTTP 200. Request payload shape includes organization/location/login and assigned workflow/activity groups; response shape includes module-grouped workflow counts/IDs. Values are redacted. | Browser observation + API response shape/status |
| CiiHive | Workflow metadata | `GET /crm/mongodb/metadata`, `/loan/mongodb/metadata`; module and workflow variants | Responses include form/module/control/workflow fields and configured hook names. | Browser observation + API response |
| CiiHive | Workflow queue | `POST /report/generate/pendingworkflow` | Request field names include organization/location/login and assigned workflow/activity fields; response has module-group keys. Values were not retained. | Browser observation + response schema |
| CiiHive | Selectors/lists | module-specific `/mongodb/lazylist`, `/sqldb/select`, and deposit SQL lazy-list endpoints | Request shapes include collection/filter/limit/includeFields/sortBy on some calls; selector responses include `controlId`, `options`. | Browser observation + response field names |

The per-application endpoint references contain the full observed endpoint
families: [LoanLeaf API inventory](./application-1/api-documentation.md) and
[CiiHive API inventory](./application-2/api-documentation.md).

## Authentication behavior

During prior authenticated route passes, initial API calls returned 401,
followed by a successful refresh request and later successful API responses.
This is **verified through browser observation and HTTP statuses**, not a
complete authentication contract. Refresh payload values, access tokens, and
credential-bearing headers were not retained.

## Payload and timing capture

The Playwright smoke tests now attach a bounded XHR/fetch observation report.
It contains host, normalized path, method, query parameter names, safe header
names, request/response payload **shapes**, status, duration, and the labelled
UI action. Scalar payload values and all header values are discarded; query
values and credential/token/cookie/API-key header names are excluded. Payload
shapes are not a substitute for approved sanitized test payloads.

The current reports also observed a browser request to `maps.googleapis.com`
from each shell. This establishes an external browser dependency, not an
application business-data integration. The report is an authenticated-shell
load observation only. Additional screen/action traces should be instrumented
through the observer's `withAction(label, operation)` wrapper. Do not trigger create, update,
approval, disbursement, deletion, or other state-changing actions on live
systems.

## Unknowns

- Complete API contracts, validation rules, and business error payloads.
- Which service handles each route and what downstream services it calls.
- Retry, idempotency, compensation, and transaction-boundary behavior.
- Database reads/writes and cross-application synchronization.
- Role enforcement beyond visible menu/control state.

See [investigation limitations](./investigation-limitations.md) for access and
evidence constraints.
