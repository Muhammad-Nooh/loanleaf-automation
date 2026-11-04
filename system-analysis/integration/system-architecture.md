# Initial System Architecture

## Verified runtime boundary

```text
Browser
  ├─ LoanLeaf UI: https://loanleaf.mfsys.com.pk
  │    └─ Observed APIs: https://ebdaa.mfsys.com.pk
  └─ CiiHive UI: https://ebdaa.mfsys.com.pk
       └─ Observed APIs: https://www.ebdaa.mfsys.com.pk

Database services: not connected or identified at the application/schema level
```

The UI/API domains and API call paths above were observed during normal
authenticated page navigation. The database servers supplied by the user have
only passed TCP reachability checks; database authentication, database names,
and which applications use which schemas are unverified.

At the time of this investigation, DNS lookups for `loanleaf.mfsys.com.pk`,
`ebdaa.mfsys.com.pk`, and `www.ebdaa.mfsys.com.pk` each returned at least one
shared address. This is compatible with a shared reverse proxy or hosting
address, but does not prove a shared application process, backend service,
deployment, or data store.

## Components observed

- Both UIs are browser-rendered applications with role/menu-based route
  surfaces.
- CiiHive uses dynamic form/workflow metadata APIs and lazy-list/select
  endpoints. Its UI menu includes CRM, Loan, Deposit, General Ledger,
  configuration, security, and other operational modules.
- LoanLeaf's UI includes customer and loan screens and workflow queues; it
  calls translation, organization date/time, SQL/Mongo selector, and list
  endpoints on the `ebdaa.mfsys.com.pk` API host.
- Both interfaces use an authentication refresh flow. Token/credential values
  were never copied to reports.

## Unverified components

Backend internals are not available through the current black-box access.
Database schema, queue/webhook behavior, service-to-service traces, and
database connections have not been observed. Backend source is not required
for this investigation. A shared host or matching module names do not prove a
shared database or direct application-to-application integration.
