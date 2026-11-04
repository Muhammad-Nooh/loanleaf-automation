# LoanLeaf Observed API Inventory

**Method:** Black-box browser network observation while navigating all 19
visible routes. Backend source is unavailable and is not required for this
analysis. Earlier route-pass records retain method, path, status, and field
names, not request/response values. Current smoke tests additionally capture
sanitized XHR/fetch payload shapes and timings; scalar values, query values,
and header values are discarded. API calls use HTTPS.

## Observed API host and endpoints

The UI is served from `loanleaf.mfsys.com.pk`; observed application API
requests were sent to `ebdaa.mfsys.com.pk`.

| Method | Endpoint | Observed request/response shape |
|---|---|---|
| GET | `/security/translation/loanleaf/getTranslations` | Response keys include `versionNo`, `ar_loanleaf`. |
| POST | `/security/auth/refreshtoken` | Request body is wrapped in a `data` field; response values were not retained. |
| GET | `/configuration/organizations/timezone` | Success response key includes `bgpGlprcompanytimezone`. |
| GET | `/configuration/organizations/{orgId}/dailyoperations/companydate` | Success response keys include `module`, `bgpGlprcompanydate`. |
| GET | `/loan/organizations/{orgId}/dailyoperations/companydate` | Same date/module shape. |
| GET | `/deposit/organizations/{orgId}/dailyoperations/companydate` | Same date/module shape. |
| GET | `/generalledger/organizations/{orgId}/dailyoperations/companydate` | Same date/module shape. |
| POST | `/loan/sqldb/select` | Request body has a `data` envelope; successful response keys include `controlId`, `options`. |
| POST | `/loan/mongodb/select` | Request body has a `data` envelope; successful response keys include `controlId`, `options`. |
| POST | `/loan/mongodb/lazylist` | Request body has a `data` envelope; list response values were not retained. |
| POST | `/security/mongodb/select` | Request body has a `data` envelope; successful response keys include `controlId`, `options`. |

## Observed response status

Across one 19-route navigation pass, 254 XHR/fetch responses were observed:
244 returned HTTP 200 and 10 returned HTTP 401. A refresh-token request
succeeded, after which the observed select/date endpoints returned HTTP 200.
The 401 response bodies exposed generic error fields (`timestamp`, `status`,
`error`, `path`); values were not retained.

## Interpretation limits

These are endpoints observed during normal UI route navigation, not a complete
API contract. Calls that require a search term, a user action, or a submitted
form were not initiated. No assumptions are made about the write endpoints,
business payloads, or database persistence. Static translation and route
manifest assets are not backend business APIs.
