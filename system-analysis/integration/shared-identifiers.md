# Candidate Shared Identifiers

The names below were observed in API field schemas. They are candidates for
cross-system mapping only; no value was compared between applications and no
database relationship was verified.

| Field name | Apparent meaning from name/context | Evidence | Confidence |
|---|---|---|---|
| `POR_ORGACODE` | Organization code | API/form metadata and workflow request schema | Medium |
| `SUS_USERCODE` | User code | User/select response field name | Medium |
| `CMP_CUSTCODE` | Customer code | CiiHive loan lazy-list response schema | Medium |
| `PIT_IDENVALUE` | Customer identity value | CiiHive loan lazy-list response schema | Medium |
| `DMP_PRODCODE` | Product code | CiiHive loan lazy-list response schema | Medium |
| `workFlowRefNum` | Workflow/reference number | CiiHive loan lazy-list response schema | Medium |
| `applicationStatus` | Application status | CiiHive loan lazy-list response schema | Medium |
| `plcLocacode` | Location/branch code | CiiHive pending-workflow request schema | Low |

Only field names were retained. These identifiers have not been proven to exist
in both applications, to be unique, or to have the same semantics in each
system. Establish their relationships only through authorized read-only
inspection and sanitized test records.
