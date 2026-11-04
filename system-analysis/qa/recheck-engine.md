# Intelligent Recheck Engine

## Commands

```powershell
npm run qa -- --app loanleaf --module "Loan Management"
npm run qa -- --app cihive --module "Customer Registration"
npm run qa -- --app loanleaf
npm run qa -- --app cihive
npm run qa -- --scope integration
npm run qa
npm run qa -- --change "Describe the change"
```

`--app` accepts `loanleaf`, `ciihive`, and the documented `cihive` spelling.
Module selections match registry names, IDs, or aliases. `--change` selects
modules whose registered names/keywords match the description; if none match,
the runner executes all registered read-only checks and notes the fallback.
Invalid or ambiguous combinations fail instead of silently running a
different selection.

## Registry and coverage boundaries

The dependency registry at
[`dependency-registry.json`](./dependency-registry.json) connects app/module,
known screen routes, observed API families, workflow evidence, integration
evidence, verified database entities, and reusable scenario IDs. Empty
database-entity lists mean **none verified**, not that no database dependency
exists.

LoanLeaf's observed route paths are rechecked directly in the authenticated
browser. CiiHive's exact metadata-driven customer/loan form routes were not
retained, so those module commands recheck the authenticated shell and mark
screen-level coverage **blocked**. The report does not count that as a form
recheck. State-changing workflows and all database validations remain excluded.

## API/UI baselines

Versioned app files live under [`../baselines/`](../baselines/). Both initial
baselines are deliberately `not-approved`, with version `0` and empty
snapshots. Observations produce a `*-baseline-candidate.json`; the runner never
promotes it or edits an approved baseline.

After review, an owner may manually copy accepted candidate content into the
appropriate baseline, increment `baselineVersion`, set
`approvalStatus: "approved"`, and record approver/date. Review credentials,
customer data, financial values, screenshot contents, endpoint ownership,
workflow meaning, and the proposed API/UI changes before approval. An approved
baseline should be committed and code-reviewed like other test expectations.

Comparisons report new/not-observed endpoints, request/response structure
changes, new HTTP statuses and errors, auth behavior, significant median
latency increases (at least 2x and at least +1000ms), and sanitized UI
structure/navigation/form-label changes. Endpoint removals are only reported
for modules with complete registered screen-route coverage. A candidate
without an approved baseline is marked **blocked-or-unverified**, not an
unexpected regression.

`expectedChanges` can be manually populated in an approved baseline using
`apiKey`, `kind`, and optional `expiresAt`; these entries are reviewed data,
never created by the runner. Supported kinds include `new-endpoint`,
`request-structure`, `response-structure`, `http-status`,
`authentication-behavior`, `response-time`, and `removed-endpoint`.
For UI changes, use `screenRoute` with `kind` `new-ui-screen`,
`ui-structure`, or `removed-ui-screen`, and optional `expiresAt`.

## Reports and privacy

Each run is stored under
[`../reports/`](../reports/) by UTC year/month/timestamp. `report.json`
contains execution time, selected modules/dependencies, test outcomes,
baseline comparisons, API/UI changes, blockers, recommendations, screenshot
paths, and cross-application API-host observations. `*-baseline-candidate.json`
is separate from approved snapshots.

Network reports retain field names and JSON types/shapes, never scalar values,
header values, or query values. External browser traffic is not part of an
application API baseline. Screenshots mask text, images, input values, and
background images before capture; they are visual structure evidence, not
business-data evidence. Playwright video and traces are disabled for the QA
projects to avoid retaining unredacted network/session data.

## Integration standard

Shared IPs, hostname similarity, and third-party browser services do not count
as LoanLeaf–CiiHive integration. Reports identify only browser requests that
reach the other application's previously observed API host and explicitly do
not infer service-to-service behavior from them. Actual record linkage remains
unknown until a permitted request/identifier and authorized read-only database
evidence correlate the same entity across both systems.
