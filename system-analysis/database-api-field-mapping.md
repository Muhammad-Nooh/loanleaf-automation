# Database-to-API Field Mapping

## Status

No SQL or MongoDB connection has been authenticated. No schemas, tables,
collections, indexes, or database records have been read. Consequently, no
API field can currently be mapped to a database field.

## Evidence-bounded field inventory

| API / metadata field | Observed context | Database object / field | Classification |
|---|---|---|---|
| `formId`, `moduleId` | CiiHive metadata responses | Unknown | Verified through API response; database mapping unknown |
| `controlTree`, `dataSelect`, `buttons`, `linkedDropdown` | CiiHive form metadata | Unknown | Verified through API response; database mapping unknown |
| `workFlowId`, `order`, workflow description/stage fields | CiiHive workflow metadata | Unknown | Verified through API response; database mapping unknown |
| `targetDB: no_sql` | Customer and loan workflow metadata | Specific database/collection unknown | Verified configuration value; does not identify a collection |
| `collection`, `filter`, `limit`, `includeFields`, `sortBy` | Some lazy-list request shapes | Collection name/field semantics unverified | Request-shape observation only |
| `controlId`, `options` | Selector response shapes | SQL/Mongo object behind selector unknown | Verified through response field names only |
| Organization, location, login, assigned-workflow/activity fields | Pending workflow report request | Backing tables/collections unknown | Request-shape observation only |
| Customer/loan business identifiers | No approved transaction or sanitized matching record observed | Unknown | Unknown due to lack of database access and correlation evidence |

## Completion procedure after access is authorized

1. Confirm dedicated least-privilege read-only MySQL and MongoDB accounts,
   VPN/TLS requirements, MongoDB authentication database, and allowed scope.
2. Inventory schemas and metadata only; do not use administrative credentials
   or retrieve unnecessary customer values.
3. Use database catalog metadata to document object names, types, keys, and
   indexes. Avoid broad record dumps.
4. Compare API field names/types against declared database columns/document
   paths using sanitized, approved existing test references.
5. Mark every mapping as **verified through database records** only when a
   read-only query establishes the relationship. Otherwise label it inferred
   or unknown.
6. Document discrepancies with sanitized identifiers and the exact evidence
   boundary; never invent table/collection names from endpoint paths.

Database access requirements are tracked in the
[database discovery status](./database/README.md).
