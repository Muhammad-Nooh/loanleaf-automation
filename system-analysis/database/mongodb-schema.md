# MongoDB Schema Discovery

**Status: Blocked.** No MongoDB authentication or metadata query has been
performed.

| Item | Status |
|---|---|
| TCP host/port reachability | Passed earlier: `192.168.0.20:27017` |
| Read-only account | Pending; supplied account not verified read-only |
| Authentication database | Unknown |
| Accessible database names | Unknown |
| Collections and indexes | Unknown |
| Document structures / references | Unknown |
| Application/module ownership | Unknown |

Do not treat UI API paths containing `/mongodb/` or CiiHive metadata
`targetDB: no_sql` as proof of MongoDB collection names or direct persistence.
The API implementation and database objects have not been inspected.

Discovery must wait for a dedicated read-only account, confirmed authentication
database, and VPN/TLS requirements. Do not copy document values into reports.
