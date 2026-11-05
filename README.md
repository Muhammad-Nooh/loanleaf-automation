# LoanLeaf Automation

UI automation (Playwright + TypeScript) for two connected apps:

| App | What it is | URL |
|---|---|---|
| **LoanLeaf** | Portal where customers and their loan accounts are created | https://loanleaf.mfsys.com.pk/auth/login |
| **CiiHive** | Core back office behind LoanLeaf (approvals, accounts) | https://ebdaa.mfsys.com.pk/#/login |

The goal is one chain: create a customer + loan account in LoanLeaf, then
verify / approve it in CiiHive.

## Setup

```
npm install
npx playwright install chromium
copy .env.example .env     # Windows (use cp on Mac/Linux), then fill in credentials
```

`.env` is gitignored. Never commit credentials.

## Run

```
npm test                    # everything
npm run test:loanleaf       # LoanLeaf only
npm run test:ciihive        # CiiHive only
npm run test:headed         # watch the browser
npm run report              # open the HTML report
npm run qa -- --app loanleaf --module "Loan Management"
npm run qa -- --app cihive --module "Customer Registration"
npm run qa -- --scope integration
npm run qa                  # all registered read-only checks
```

Each app logs in once in a `setup` project and the session is saved under
`.auth/`, so the tests themselves start already logged in.

## Finding selectors

Login locators in `src/pages/*/LoginPage.ts` are first guesses. Record the real
ones with:

```
npm run codegen:loanleaf
npm run codegen:ciihive
```

## Layout

| Path | Purpose |
|---|---|
| `src/core/env.ts` | Reads `.env`, defines saved-session paths |
| `src/pages/loanleaf/`, `src/pages/ciihive/` | One page object per screen |
| `src/data/customer.ts` | Fresh unique test customer per run |
| `tests/setup/` | Login steps that save each app's session |
| `tests/loanleaf/`, `tests/ciihive/` | Specs, numbered in chain order |

## Building the flow (test systems only)

The end-to-end flow lives in `tests/flow/` and runs in order:

1. **LoanLeaf:** create customer profile and submit the loan application (one session, because saving the customer continues straight into the application)
2. **LoanLeaf:** approve the loan through every stage
3. **CiiHive:** Cash Transaction > Loan > Disbursement (loan account + amount), Save
4. **CiiHive:** Authorization > Loan, authorize the disbursement

```
$env:ALLOW_WRITES="1"; npm run flow:headed      # PowerShell
ALLOW_WRITES=1 npm run flow:headed              # Mac / Linux
```

Without `ALLOW_WRITES=1` these specs skip, so `npm test` never changes data.
Facts passed between steps are kept in `run-state/chain.json`.

Status: steps 1 and 2 are written from a recording of LoanLeaf. The stages
Assign Inspector, Second Visit and Executive Approval were only opened in that
recording, so they follow the usual pattern and may need a fix after a first
run. Steps 3 and 4 are `test.fixme` until a CiiHive recording is added.

Page logic is in `src/flow/loanleaf/` (`ui.ts` has the dropdown helpers,
`customer.ts`, `application.ts`, `approvals.ts`). Uploads use `fixtures/sample.pdf`.

To record a step, use English and a test customer:

```
npx playwright codegen "https://ebdaa.mfsys.com.pk/#/login" -o recorded-ciihive.ts
```

Never commit recordings that contain typed passwords (`recorded-*.ts` is gitignored).

## System analysis

The evidence-bounded application inventories, observed APIs, integration
findings, database access status, and QA scenarios are maintained in
[system-analysis/README.md](./system-analysis/README.md). Database schemas and
cross-application synchronization remain unverified until read-only access and
authorized correlation evidence are available. The reusable recheck framework,
dependency registry, baseline approval process, and historical reports are
described in [system-analysis/qa/recheck-engine.md](./system-analysis/qa/recheck-engine.md).

## Roadmap

- [ ] Get both logins passing
- [ ] LoanLeaf: create customer
- [ ] LoanLeaf: create loan account for the customer
- [ ] CiiHive: find and approve the customer / loan
- [ ] Share records between apps via `run-state/chain.json`
