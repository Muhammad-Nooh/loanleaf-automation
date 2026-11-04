# Phase 1: Environment, Authentication, and Connectivity

**Status:** Complete
**Verified:** 2026-11-04

## Environment

- The project is a TypeScript Playwright test suite with strict TypeScript
  checking enabled.
- Playwright and project dependencies are installed.
- Application URLs and credentials are loaded from the local `.env` file.
- `.env` and `.auth/` are excluded from Git. Credentials and browser storage
  states are not documented here.
- Separate Playwright projects save authenticated state for each application.

## Verified connectivity and authentication

| Application | Login page connectivity | Authentication | Evidence |
|---|---|---|---|
| LoanLeaf | HTTP 200 | Passed | Playwright setup test |
| CiiHive | HTTP 200 | Passed | Playwright setup test |

Both authentication setup tests passed after updating LoanLeaf's login flow to
fill its organization number, user number, and password. The observed LoanLeaf
login page was Arabic-localized; its accessible labels and submit button are
handled in both Arabic and English.

The local LoanLeaf configuration now includes an organization-code setting.
The supplied organization code and user ID are kept only in the ignored local
`.env` file.

## Validation

- `npx playwright test --project=setup-loanleaf --project=setup-ciihive` —
  passed (2 setup tests).
- `npx tsc --noEmit` — passed.
- Both login URLs returned HTTP 200.
- TCP connections to the shared MySQL endpoint (`192.168.0.20:3306`) and
  MongoDB endpoint (`192.168.0.20:27017`) succeeded from the current environment.

## Scope and limitations

- This phase verified access and authentication only; it did not submit or
  modify application data.
- Business workflows, menus, role permissions, APIs, and integration behavior
  have not yet been explored.
- Backend source repositories are not available. The investigation now uses a
  black-box approach through browser behavior, observed APIs, and authorized
  read-only database evidence when access is supplied.
- No database protocol handshake, authentication, enumeration, or data access
  was performed. The supplied MySQL account is administrative, and dedicated
  read-only accounts for exploration are pending.
- TCP reachability confirms the current network path reaches both ports; it
  does not establish whether VPN access is required in other environments.
- VPN/TLS requirements, database names, and read-only credentials remain
  unconfirmed.

## Subsequent investigation

Read-only LoanLeaf/CiiHive UI and API exploration is documented in the
application analysis. Database authentication/schema discovery remains blocked
until dedicated read-only accounts and connection requirements are confirmed.
No create, approve, reverse, or delete actions are in scope without explicit
authorization for a controlled test.
