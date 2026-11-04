# Investigation Limitations

## Access and source limitations

- Backend repositories/source code for LoanLeaf and CiiHive are not available
  and are not required for this black-box investigation.
- Browser access is limited to the authenticated user session and visible
  screens/controls. Hidden routes, other user roles, server internals, and
  direct service-to-service traffic may not be observable from this client.
- Dedicated read-only MySQL and MongoDB credentials have not been supplied.
  The MySQL administrative account was not used; the MongoDB account has not
  been confirmed as read-only and was not used.
- VPN/network routing, TLS/CA requirements, permitted database scope, and
  MongoDB authentication database remain unconfirmed.

## Evidence limits

- Browser-observed calls prove that the UI issued a request; they do not prove
  which internal service processed it or what that service did.
- API response fields/statuses do not prove database persistence, business
  correctness, or external-system communication.
- Workflow metadata hook names prove configuration only, not hook invocation
  or implementation.
- Menu visibility does not prove effective permission. Disabled controls do
  not establish why a control is disabled.
- DNS/IP overlap does not prove shared backend deployment or storage.
- Current saved API documentation retains endpoints, statuses, and field
  names, not original request/response values. The new Playwright observer
  keeps payload structure only and intentionally discards scalar values,
  credential-bearing headers, and query values.
- Timing and action attribution are available only for new instrumented runs.
  Earlier route-level observations do not reliably associate every call with a
  specific control action.
- No production business write, approval, disbursement, deletion, or failure
  injection is permitted under the current scope.

## Confidence labels

Use the following in all new findings:

1. **Verified through browser observation** — screen, route, or UI action
   observed in an authorized browser session.
2. **Verified through API response** — response status/schema/configuration
   directly observed; retain only approved sanitized evidence.
3. **Verified through database records** — read-only database evidence confirms
   the object/value relationship.
4. **Inferred but not verified** — interpretation consistent with evidence but
   not directly demonstrated.
5. **Unknown due to lack of access** — evidence is unavailable or the action
   was not safely performed.

## Inputs needed to expand coverage

- Dedicated read-only SQL/Mongo credentials and approved secret-delivery
  mechanism.
- VPN/TLS and database-scope confirmation.
- Explicit role accounts for permission comparison.
- Sanitized, approved existing test references present in both systems.
- Authorized non-production environment and explicit approval for write-flow
  testing.
