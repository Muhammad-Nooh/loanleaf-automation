# Application-to-Database Mapping

**Status: Not yet verifiable.** No database object has been inspected. This
document intentionally contains unknowns instead of guessed table or
collection names.

| Application | Module / screen | Observed API surface | SQL table | MongoDB collection | Confidence / limitation |
|---|---|---|---|---|---|
| LoanLeaf | Customer Profile | LoanLeaf UI emitted loan selector/list calls during route visit; no write call observed | Unknown | Unknown | Route/API correlation does not establish persistence target. |
| LoanLeaf | Loan Application | Loan selector/list and module date calls observed during route visit; no write call observed | Unknown | Unknown | No application was submitted. |
| LoanLeaf | Loan review / authorization queues | Visible routes; no approval action or record correlation | Unknown | Unknown | Read-only route presence only. |
| CiiHive | CRM Individual Customer registration | `GET /crm/mongodb/metadata`; form metadata declares `targetDB: no_sql`, workflow and `CREATE_CUSTOMER_PROFILE` hook on the authorization form | Unknown | Unknown | Declarative metadata; hook was not executed and `no_sql` is not a verified collection. |
| CiiHive | Individual Loan creation | `GET /loan/mongodb/metadata`; metadata declares `targetDB: no_sql`, workflow stages, and configured hooks | Unknown | Unknown | Declarative metadata only; no create submission. |
| CiiHive | Individual Loan authorization | `GET /loan/mongodb/metadata`; metadata declares `OPEN_LOAN_ACCOUNT` and `UPDATE_LOAN_ACCOUNT` hooks | Unknown | Unknown | Declarative metadata only; no authorization executed. |
| Both | Cross-application customer/loan record | No record-level ID or data match observed | Unknown | Unknown | Database credentials and controlled test record are unavailable. |

Schema discovery is tracked in the [database status](./README.md).
