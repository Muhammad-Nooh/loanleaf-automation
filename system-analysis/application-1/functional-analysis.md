# LoanLeaf Functional Analysis

## Verified screens and behavior

- The authenticated shell and all 19 visible route targets were reachable.
- The default UI language was Arabic.
- The dashboard exposes application status summaries, a loan-follow-up area,
  and actions labelled for starting a loan, registering a customer, and
  generating a schedule. Dashboard data values are intentionally omitted.
- The dashboard schedule controls include loan product and amount (both marked
  with `*`), annual interest rate, duration, frequency, disbursement date, and
  first-installment date. Rate, duration, and frequency controls were disabled
  before a product was selected. No product was selected and no schedule was
  generated.
- The Customer Profile route rendered a multi-field customer form. Visible
  labels cover identity, country/nationality, expiry and birth dates, gender,
  consent, Arabic and English names, and related profile details. Field labels
  display `*` for required-looking fields.
- Loan Application rendered 23 native controls and a workflow/schedule grid.
  Visible fields include customer identifier, disbursement IBAN, account
  details, and customer profile information. Actions include Create Schedule,
  Clear Schedule, Notify, and Continue. The grid labels include user/date/
  comments/workflow stage and installment principal/interest/total. No action
  was activated.
- Loan workflow screens expose the stages listed in the [module inventory](./module-inventory.md).
- Loan Inquiry displays search controls and a results grid with loan/product,
  application, customer, and amount columns. No inquiry was submitted.
- Change Password displays current password, new password, and confirmation
  fields. The [evidence screenshot](../evidence/loanleaf-password-settings.png)
  masks inputs and the visible account label.
- Permission Management exposes allocation type, user, and role controls;
  no permission was changed.

## Validation and dependencies

- Asterisk markers are visible on some labels, including dashboard loan
  product/amount and customer identity/profile fields. These markers are
  evidence of required-looking inputs, not verified server-side validation.
- The dashboard's rate/duration/frequency dependencies on product selection
  are inferred from the disabled state before selection; the dependency was
  not exercised.
- No invalid or boundary inputs were submitted. Error messages, field-level
  validation, approval criteria, and status transition guards remain
  unverified.

## Runtime and errors

- Observed application API calls to the shared `ebdaa.mfsys.com.pk` host first
  included HTTP 401 responses, followed by a successful refresh-token request
  and successful retries. See the [API inventory](./api-documentation.md).
- One client-side console error, `$(...).parsley is not a function`, was
  observed during the initial page load. Its impact on form validation was not
  tested. Repeated `Element not found` console errors were also observed during
  that load; their cause and impact are unknown.
- A dashboard view contains live application data. Record values were not
  retained in documentation or screenshots.

## Not verified

CRUD completion, required-field enforcement, dropdown contents, sorting and
pagination behavior, error handling after failed operations, approval
permissions, and integration outcomes require controlled test cases or
authorized existing test records. No live record was created, updated,
approved, deleted, or reversed.
