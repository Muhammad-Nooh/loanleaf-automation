# Database Discovery Status

## Status: blocked before authentication

The shared MySQL and MongoDB ports passed TCP reachability checks from the
current environment during Phase 1. No database protocol handshake,
authentication, database enumeration, schema inspection, collection listing,
or record read has been performed.

| Engine | Supplied endpoint | Account status |
|---|---|---|
| MySQL | `192.168.0.20:3306` | `root` was identified as administrative; a dedicated read-only account is pending and root was not used. |
| MongoDB | `192.168.0.20:27017` | `mfsys` was supplied, but a dedicated read-only account/authentication database is pending; no authentication was attempted. |

The user supplied `root` for MySQL and explicitly identified it as
administrative, with a dedicated read-only account still pending. That account
has not been used. MongoDB's `mfsys` account has not been established as
read-only, so it has not been used either.

The local `.env` currently contains only application-login variables; no
database connection settings or read-only account credentials are present.
The host/port values and account names supplied by the user are not credentials
for an authorized schema session.

## Required before discovery

- Dedicated least-privilege read-only MySQL username and password.
- Dedicated least-privilege read-only MongoDB username and password.
- VPN/network route confirmation from the machine running discovery.
- TLS requirements and CA material if required.
- MySQL catalog/database allowlist or confirmation of permitted schema listing.
- MongoDB authentication database and permitted database/collection scope.
- Approval to inspect production metadata. Customer/document samples, if
  needed, must be sanitized and limited to non-sensitive structure.

Passwords should be supplied through an approved secret mechanism/local
environment variables, never in source control or generated documentation.

## Planned documents

- [MongoDB schema](./mongodb-schema.md)
- [SQL schema](./sql-schema.md)
- [Table relationships](./table-relationships.md)
- [Collection relationships](./collection-relationships.md)
- [Application mapping](./database-mapping.md)

All structures and object names in those documents remain explicitly
undiscovered until read-only access is established.
