# CiiHive Observed API Inventory

**Method:** Black-box XHR/fetch observation during read-only navigation of 177
visible routes. Backend source is unavailable and is not required for this
analysis. Earlier route-pass records retain paths, statuses, and field names;
request/response values and customer records were not retained. Current smoke
tests additionally capture sanitized XHR/fetch payload shapes and timings;
scalar values, query values, and header values are discarded.

## Host and session behavior

The UI is served from `ebdaa.mfsys.com.pk`; observed APIs used
`www.ebdaa.mfsys.com.pk`.

The first requests included HTTP 401 responses. A successful
`POST /security/auth/refreshtoken` was then observed; its request field names
included `clientid`, `username`, `password`, and `token`, and its response
included a `token` field. No values were captured. Later requests to the
observed endpoints returned HTTP 200.

## Observed endpoints

| Area | Method and endpoint | Observed shape / use |
|---|---|---|
| Authentication | POST `/security/auth/refreshtoken` | Request fields: `clientid`, `username`, `password`, `token`; response key: `token`. |
| Menus | GET `/security/menu/appmenu`, GET `/security/menu/menubar` | Menu data; `appmenu` response includes `moduleItems`. |
| Translation | GET `/security/translation/getTranslations` | Response keys include version and language dictionaries. |
| Organization | GET `/security/organization/select`, GET `/security/organization/{orgId}/geogroups` | Organization/geographic lookup. |
| Time / branch | GET `/configuration/organizations/timezone`, GET `/configuration/organizations/{orgId}/dailyoperations/companydate`, GET `/loan/organizations/{orgId}/dailyoperations/companydate`, GET `/deposit/organizations/{orgId}/dailyoperations/companydate`, GET `/generalledger/organizations/{orgId}/dailyoperations/companydate` | Timezone or module/company-date fields. |
| Workflow queue | POST `/report/generate/pendingworkflow` | Request field names: `porOrgacode`, `plcLocacode`, `mfsysLogin`, `assignedWorkflows`, `assignedActivities`; response contains module-group keys. |
| CRM | GET `/crm/mongodb/metadata`, GET `/crm/mongodb/metadata/module`, GET `/crm/mongodb/workflow`, POST `/crm/mongodb/lazylist` | Form metadata, workflow definitions, and lazy-list requests. |
| Loan | GET `/loan/mongodb/metadata`, GET `/loan/mongodb/metadata/module`, GET `/loan/mongodb/workflow`, POST `/loan/mongodb/lazylist`, POST `/loan/sqldb/select` | Form/workflow metadata, lazy-list lookup, and selector data. `sqldb/select` response keys include `controlId`, `options`. |
| Deposit | GET `/deposit/mongodb/metadata`, GET `/deposit/mongodb/metadata/module`, GET `/deposit/mongodb/workflow`, GET `/deposit/mongodb/workflow/module`, POST `/deposit/mongodb/lazylist`, POST `/deposit/sql/lazylist`, POST `/deposit/sqldb/select` | Form/workflow metadata and selector/list resources. |
| General Ledger | GET `/generalledger/mongodb/metadata`, GET `/generalledger/mongodb/metadata/module`, GET `/generalledger/mongodb/workflow`, POST `/generalledger/mongodb/lazylist` | Form/workflow metadata and lazy-list resources. |
| Configuration | GET `/configuration/mongodb/metadata`, GET `/configuration/mongodb/metadata/module`, GET `/configuration/mongodb/workflow`, POST `/configuration/mongodb/lazylist`, GET `/configuration/replicated-forms`, GET `/configuration/blacklist-replicated-forms` | Metadata includes fields such as `controlTree`, `dataSelect`, `buttons`, `linkedDropdown`, workflow and constraint metadata. |
| Notification | GET `/notification/mongodb/metadata`, GET `/notification/mongodb/metadata/module` | Form/module metadata. |
| Security administration | GET `/security/mongodb/metadata`, GET `/security/mongodb/metadata/module`, GET `/security/activity/users`, GET `/security/user/select`, GET `/security/role/select` | Security form metadata, user/role lookup, and activity/user data. |

The full route-level call set also includes repeated date/metadata calls as
screens load. Static `/assets/data/*.json` form definitions are configuration
assets, not API endpoints.

## Field-name-only response shapes

- Mongo metadata objects expose names such as `formId`, `moduleId`,
  `controlTree`, `dataSelect`, `buttons`, `linkedDropdown`, `preApiCall`,
  `postApiCall`, `uniqueConstraints`, and `workFlow`.
- Workflow metadata exposes `workFlowId`, `order`, and workflow description
  fields.
- Lazy-list requests include names such as `collection`, `filter`, `limit`,
  `includeFields`, and `sortBy` on some modules. Response values were not
  recorded.
- User/activity data response schema included a `SUS_PASSWORD` field name.
  This is a field-name observation only; no field value was logged or retained.

## Read-only form metadata trace

| Form | Module / workflow configuration | Configured hooks |
|---|---|---|
| `BN_WF_CP_REGISTRATION` | `crm`, `workflow`, `targetDB: no_sql`, workflow `BN_WF_CP_CUSTOMERPROFILE`, next stage `BN_WF_CP_AUTHORIZATION` | No `preApiCall` or `postApiCall` entry on the registration form metadata observed. |
| `BN_WF_CP_AUTHORIZATION` | `crm`, `workflow`, `targetDB: no_sql`, workflow `BN_WF_CP_CUSTOMERPROFILE` | `CREATE_CUSTOMER_PROFILE` at `performAt: create`. |
| `BN_WF_IL_CREATELOAN` | `loan`, `workflow`, `targetDB: no_sql`, workflow `BN_WF_IL_INDIVIDUALLOAN`, next stage `BN_WF_IL_LOANREVIEW` | `SAVE_WORKFLOW_NUMBER` at create; `UPDATE_LOAN_ACCOUNT` at update. |
| `BN_WF_IL_AUTHORIZELOAN` | `loan`, `workflow`, `targetDB: no_sql`, workflow `BN_WF_IL_INDIVIDUALLOAN` | `OPEN_LOAN_ACCOUNT` at create; `UPDATE_LOAN_ACCOUNT` at update. |

These are API-returned configuration values obtained by opening the
corresponding UI routes. No form submission occurred. `targetDB: no_sql` is a
configuration value and is not sufficient by itself to identify a MongoDB
database or collection.

These observations describe UI-generated calls, not a complete or authorized
API contract. No write operation was submitted or replayed.
