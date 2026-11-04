# SQL Schema Discovery

**Status: Blocked.** No MySQL authentication or metadata query has been
performed.

| Item | Status |
|---|---|
| TCP host/port reachability | Passed earlier: `192.168.0.20:3306` |
| Supplied `root` account | Administrative; explicitly not used |
| Dedicated read-only account | Pending |
| Accessible schema/database names | Unknown |
| Tables, columns, and types | Unknown |
| Primary/foreign keys and indexes | Unknown |
| Views, triggers, and routines | Unknown |
| Application/module ownership | Unknown |

Observed browser paths such as `/loan/sqldb/select` are API endpoint names, not
proof of specific SQL tables or access paths. No table name is inferred from
those endpoints.

Discovery must wait until a dedicated read-only account and VPN/TLS
requirements are confirmed.
