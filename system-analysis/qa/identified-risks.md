# Initial QA and Operational Risks

These are evidence-backed items to validate, not confirmed defects. No
security testing or business transaction was performed.

| Observation | Evidence | Risk / follow-up |
|---|---|---|
| Browser local storage contains a key named `password`; CiiHive refresh-request schema also contains a `password` field name. | Authenticated browser storage key names and redacted request field names only. | Have the application/security owner verify the storage and refresh-token design. Values were not inspected, logged, or retained; plaintext exposure is not established. |
| CiiHive user/activity response schema includes a `SUS_PASSWORD` field name. | Field-name-only response shape from `/security/activity/users`. | Verify server-side field filtering/masking. No field value was logged or retained. |
| CiiHive's initial browser load emitted a malformed Content-Security-Policy directive parsing warning. | Chromium console message during initial UI load. | Review the served CSP header and intended source directives. No exploitability assessment was performed. |
| LoanLeaf emitted `$(...).parsley is not a function` and repeated `Element not found` console errors on initial load. | Chromium page/console events. | Check whether validation/UI components are affected; no invalid form was submitted. |
| Both applications emitted initial HTTP 401 API responses before successful refresh and later 200 responses. | One read-only route pass per app. | Confirm expected expiry/refresh behavior and ensure automated tests distinguish transient refresh from persistent authorization failures. |
| Customer-registration native inputs were disabled while the wizard Next control was enabled. | CiiHive Individual Customer registration screen, inspected without advancing. | Clarify expected role/workflow state and test with an authorized role; do not infer a permission defect from this single session. |

## Out of scope / pending

- Database access, schema validation, and data-integrity checks are blocked
  until dedicated read-only accounts and VPN/TLS requirements are confirmed.
- API authorization boundaries and role-based access need an explicitly
  authorized security/permission test plan.
- Screenshots retained in `../evidence/` mask form controls and grids.
