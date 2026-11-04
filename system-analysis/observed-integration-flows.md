# Observed Integration Flows

## Scope and evidence standard

No LoanLeaf-to-CiiHive business transaction was submitted, and no existing
customer/loan record was correlated across the applications. The flows below
separate visible/configured workflow from demonstrated data transfer.

## Customer registration

1. **Start/screen — verified through browser observation:** CiiHive CRM exposes
   an individual-customer registration workflow (`BN_WF_CP_REGISTRATION`).
2. **API — verified through browser observation:** opening the form fetches
   `/crm/mongodb/metadata`; read-only metadata declares workflow
   `BN_WF_CP_CUSTOMERPROFILE`, `targetDB: no_sql`, and next stage
   `BN_WF_CP_AUTHORIZATION`.
3. **Configured next-stage behavior — verified through API response:** the
   customer authorization form metadata declares `CREATE_CUSTOMER_PROFILE` at
   create.
4. **Actual submission, hook execution, persistence, LoanLeaf handoff,
   identifiers, duplicate handling, and status sync — unknown due to lack of
   access/evidence.**

LoanLeaf customer screens were observed and emitted read-only selector/list
calls, but no matching customer identifier or cross-app request was captured.

## Loan application and account opening

1. **Start/screen — verified through browser observation:** CiiHive exposes
   individual loan create and authorization forms.
2. **API — verified through browser observation:** form navigation fetches
   `/loan/mongodb/metadata`.
3. **Configured workflow — verified through API response:** creation metadata
   declares workflow `BN_WF_IL_INDIVIDUALLOAN`, next stage
   `BN_WF_IL_LOANREVIEW`, and hooks `SAVE_WORKFLOW_NUMBER` at create and
   `UPDATE_LOAN_ACCOUNT` at update. Authorization metadata declares
   `OPEN_LOAN_ACCOUNT` at create and `UPDATE_LOAN_ACCOUNT` at update.
4. **Actual create/update/approval, hook execution, account creation,
   disbursement, downstream application request, persistence, retry, and
   status synchronization — unknown due to lack of access/evidence.**

LoanLeaf loan routes emitted selectors/lists during navigation, but no
LoanLeaf loan was correlated with a CiiHive workflow or account.

## Authentication refresh (non-business flow)

During prior normal route navigation, initial XHR/fetch requests received 401,
then a refresh-token request succeeded and subsequent requests received 200.
This is **verified through browser observation and response status**. It does
not demonstrate business transaction retry or error recovery.

## Address-level relationship

LoanLeaf and CiiHive use different observed API hostnames. A common resolved
IP address was observed for the three hostnames during an earlier lookup.
This is consistent with shared hosting/proxying but does not prove a shared
service, shared database, or inter-application request.

## Hook investigation status

| Hook | Evidence | Classification | Still unknown |
|---|---|---|---|
| `CREATE_CUSTOMER_PROFILE` | Declared on CiiHive customer authorization metadata at create | Verified through API response (configuration only) | Invocation, request/response, side effects, record IDs, persistence, retries |
| `SAVE_WORKFLOW_NUMBER` | Declared on CiiHive individual-loan create metadata at create | Verified through API response (configuration only) | Value written, target object, timing, failure handling |
| `UPDATE_LOAN_ACCOUNT` | Declared on individual-loan create/update and authorization update metadata | Verified through API response (configuration only) | Invocation conditions, affected account, state transition |
| `OPEN_LOAN_ACCOUNT` | Declared on individual-loan authorization metadata at create | Verified through API response (configuration only) | Whether/when account opens, account ID, duplicate guard, downstream effects |

Do not label these hooks as backend implementations or claim their effects
until an authorized non-production action or matching existing-record evidence
is available.
