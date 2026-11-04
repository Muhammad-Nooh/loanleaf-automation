# End-to-End Data Flow (Evidence-Bounded)

This document records what is currently known and labels configuration as
configuration. It does not claim that a form submission or cross-app
synchronization occurred.

## Entity traceability matrix

| Entity / operation | Frontend owner and screen | Observed API / configured hooks | Service processing (not externally observable) | SQL table | MongoDB collection | Cross-app dependency / status |
|---|---|---|---|---|---|---|
| Customer registration (LoanLeaf) | LoanLeaf → Customer Profile | LoanLeaf UI route is visible; selector/list API calls appeared during route navigation. No write request observed. | Unknown from browser evidence | Unknown | Unknown | No CiiHive record correlation. |
| Customer registration (CiiHive) | CiiHive → CRM → Individual Customer; form `BN_WF_CP_REGISTRATION` | `GET /crm/mongodb/metadata`; metadata declares `targetDB: no_sql`, workflow `BN_WF_CP_CUSTOMERPROFILE`, next stage `BN_WF_CP_AUTHORIZATION`. The authorization form metadata declares `CREATE_CUSTOMER_PROFILE` at `performAt: create`. | Hook execution and effects not observed | Unknown | Unknown | CiiHive configuration evidence only; cross-app synchronization not established. |
| Customer information synchronization | No verified initiating event | No request, callback, queue message, or matching identifiers observed | Unknown | Unknown | Unknown | Unknown direction, transform, retry, and source of truth. |
| Individual loan application (LoanLeaf) | LoanLeaf → Loan Application | Loan selectors/lazy-list appeared during route visit; no write request observed. | Unknown from browser evidence | Unknown | Unknown | No matching CiiHive loan record observed. |
| Individual loan creation (CiiHive) | CiiHive → Loan → Individual Loan; form `BN_WF_IL_CREATELOAN` | `GET /loan/mongodb/metadata`; metadata declares `targetDB: no_sql`, workflow `BN_WF_IL_INDIVIDUALLOAN`, next stage `BN_WF_IL_LOANREVIEW`, and hooks `UPDATE_LOAN_ACCOUNT` on update and `SAVE_WORKFLOW_NUMBER` on create. | Hook execution and effects not observed | Unknown | Unknown | CiiHive configuration evidence only. |
| Loan processing / approval | CiiHive → Loan approval / Individual Loan authorization (`BN_WF_IL_AUTHORIZELOAN`) | Authorization metadata declares `OPEN_LOAN_ACCOUNT` at create and `UPDATE_LOAN_ACCOUNT` at update. | Hook execution and effects not observed | Unknown | Unknown | No status exchange between apps observed. |
| Loan account creation | CiiHive loan authorization configuration | `OPEN_LOAN_ACCOUNT` is declared in form metadata, not observed as an executed request. | Unknown | Unknown | Unknown | Result and account identifier unknown. |
| Loan disbursement | LoanLeaf/CiiHive disbursement/authorization screens are visible | No disbursement call or transaction submitted | Unknown | Unknown | Unknown | No disbursement or synchronization evidence. |
| Transaction status / failure / retry | Workflow queues and status views exist | Initial API 401 → token refresh → later 200 observed at session level; unrelated to a business transaction failure | Unknown | Unknown | Unknown | Business retry/idempotency behavior unknown. |

## Verified request boundary

- LoanLeaf UI uses API host `ebdaa.mfsys.com.pk`; CiiHive UI uses
  `www.ebdaa.mfsys.com.pk`.
- At the time of investigation, the LoanLeaf UI host and both API hostnames
  resolved to at least one common address. This indicates address-level
  hosting overlap only; it does not prove a common backend service.
- CiiHive create/authorization screens fetch module metadata from
  `/crm/mongodb/metadata` or `/loan/mongodb/metadata` using `formId` and
  organization query parameters.
- Metadata fields include workflow IDs, target database kind, next/previous
  workflow stages, and configured `preApiCall`/`postApiCall` hooks.
- These observations establish UI-to-API metadata retrieval only. They do not
  establish API-to-database writes or a LoanLeaf-to-CiiHive transaction.
- Configured hook names are metadata evidence only. They do not establish that
  these functions were invoked, which backend service implements them, or what
  database objects they touch.

## Evidence required to complete the trace

1. Instrumented, authorized non-production browser traces for each permitted
   workflow action, including request/response timing and sanitized payloads.
2. Read-only SQL and MongoDB accounts, VPN/TLS requirements, and confirmed
   authentication database.
3. An approved sanitized customer/loan reference already present in both systems,
   or explicit authorization for a controlled non-production transaction.
4. Read-only database evidence that correlates the same identifier across request,
   response, workflow queue, and persistence layer.
5. Authorized non-production observations for failure handling, duplicate
   prevention, retry, and rollback.

Until then, do not claim a table/collection mapping, source of truth,
synchronization direction, or status propagation rule.
