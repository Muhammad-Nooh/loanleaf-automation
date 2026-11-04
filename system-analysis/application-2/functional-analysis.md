# CiiHive Functional Analysis

## Verified application shell and navigation

- The application title is **MFSys Financial Application**.
- The authenticated shell displayed a branch context, a top bar, and menu
  groups for Designer, CRM, Loan, Deposit, Term Deposit, General Ledger,
  User Batch Management, Instrument Management, Bank Setup, Company,
  Security, Product, Configuration, and Notification.
- 177 distinct menu-route targets were opened in the authenticated session.
  Their inventory is in [module-inventory.md](./module-inventory.md).
- Several routes are dynamic form screens driven by `moduleId`, `formId`, and
  operation query parameters.

## Representative form observations

- The Individual Customer registration screen is a 12-step wizard:
  Re-Registration, Address, Identifier, Documents, KYC, Employment,
  Occupation, Spouse Details, Relative Details, Scheduled Interview,
  Additional, and Overview.
- Its first step displayed identity and profile fields including nature,
  identifier type/value, benefit acknowledgement, Arabic and English names,
  birth details, gender, nationality, dependents, disability, education,
  housing, and income. Many labels include `*`.
- The observed DOM contained 40 native controls on this screen. Native input
  controls were disabled in the inspected state; the wizard's Next control was
  enabled. Custom controls and the reason for the disabled state were not
  exhaustively determined. No step was advanced.
- Individual Loan creation exposed a multi-step form with 31 native controls
  and a Next control. No field values or customer records were entered.
- Read-only metadata for `BN_WF_CP_REGISTRATION` declares module `crm`,
  form type `workflow`, `targetDB: no_sql`, and workflow
  `BN_WF_CP_CUSTOMERPROFILE` with next stage `BN_WF_CP_AUTHORIZATION`.
  The separate customer authorization form metadata declares a
  `CREATE_CUSTOMER_PROFILE` hook on its create operation.
- Read-only metadata for `BN_WF_IL_CREATELOAN` declares module `loan`,
  form type `workflow`, `targetDB: no_sql`, and workflow
  `BN_WF_IL_INDIVIDUALLOAN` with next stage `BN_WF_IL_LOANREVIEW`. It lists
  `SAVE_WORKFLOW_NUMBER` at create and `UPDATE_LOAN_ACCOUNT` at update.
- Loan authorization metadata `BN_WF_IL_AUTHORIZELOAN` declares
  `OPEN_LOAN_ACCOUNT` at create and `UPDATE_LOAN_ACCOUNT` at update.
- These are configured metadata hooks. Their server-side implementation,
  invocation timing in a real transaction, persistence destination, and
  resulting account/customer records were not inspected or executed.
- The [customer-registration screenshot](../evidence/ciihive-customer-registration.png)
  masks form controls.

## API-backed behavior observed

Normal navigation loaded form/workflow metadata and lazy-list/select resources
from the application API. In one 177-route pass, 557 XHR/fetch responses were
observed: 549 HTTP 200 and 8 initial HTTP 401 responses. An auth refresh
request succeeded; subsequent observed metadata/list requests returned 200.
The [API inventory](./api-documentation.md) records endpoint patterns and
field names only.

## Validation and permissions

- Required-looking fields display a visible `*` marker; native `required`
  attributes were not consistently set. Server/client validation was not
  exercised.
- No CRUD, authorization, approval, reversal, or other transaction action was
  submitted.
- Menu visibility does not establish effective role permissions. The disabled
  native inputs on the customer registration screen are an observed state,
  not proof of a specific authorization rule.
- No invalid or boundary inputs were entered. Error messages, approval
  transitions, and editability for other roles remain unknown.

## Runtime limitations

- The page shell and static form configuration loaded successfully. Some
  initial requests returned 401 before the automatic refresh; the request
  values and token were not inspected or retained.
- The initial browser load emitted a Content-Security-Policy parsing warning
  for an invalid directive name. No security testing was performed; the header
  should be checked by the application owner.
- API response values and customer data were excluded from documentation.
- Backend internals are not observable through current access; conclusions
  about server-side validation, authorization, and persistence remain
  evidence-limited.
