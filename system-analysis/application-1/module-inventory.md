# LoanLeaf Module Inventory

**Evidence status:** The authenticated navigation exposed 19 distinct route
targets. Each was opened through in-app navigation; no form was submitted.
Menu text is displayed in Arabic in this session. English names below are
translations of visible menu labels and route names.

| Area | Visible screen/menu | Route |
|---|---|---|
| Home | Dashboard | `/home/loan/dashboard` |
| Customer | Customer Profile | `/home/loan/customerProfile` |
| Loan | Loan Application | `/home/loan/loanApplication` |
| Loan | On-hold Applications | `/home/loan/onholdApplication` |
| Loan | Returned Applications | `/home/loan/returnedApplication` |
| Loan | Update Inspector | `/home/loan/updateInspector` |
| Loan workflow | Application Review | `/home/loan/pendingReview` |
| Loan workflow | Assign Inspector | `/home/loan/pendingSecondVisitStage1` |
| Loan workflow | Second Visit | `/home/loan/pendingSecondVisitStage2` |
| Loan workflow | Credit Officer / Collection Review | `/home/loan/pendingCreditOfficerReview` |
| Loan workflow | Final Collection Review | `/home/loan/pendingCollectionReview` |
| Loan workflow | Executive Loan Decision | `/home/loan/pendingLoanDecision` |
| Loan workflow | Notify Customer | `/home/loan/pendingNotifyCustomer` |
| Loan workflow | Promissory Note | `/home/loan/pendingPromissoryNote` |
| Loan workflow | Loan Authorization / Disbursement Review | `/home/loan/pendingLoanAuthorization` |
| Inquiry | Loan Inquiry | `/home/inquiry/loanInquiry` |
| Translation | Edit Translation | `/home/translation/editTranslation` |
| Settings | Change Password | `/home/settings/changePassword` |
| Security | Permission Management | `/home/loan/permission` |

The application shell also exposed navigation groups for pending applications,
inquiry, translation, and profile/settings. These are menu groups, not
additional route targets.

## Static route manifest (not proof of user access)

The publicly loaded `assets/data/app.uri.json` manifest lists 10 domain groups
and page-definition counts:

| Manifest domain | Page definitions |
|---|---:|
| Security | 17 |
| Shield | 79 |
| CRM | 55 |
| Credit Scoring | 3 |
| MConnect | 9 |
| Loan | 18 |
| Configuration | 2 |
| General Ledger | 1 |
| Deposit | 1 |
| Report | 3 |

These are manifest counts, not counts of screens available to this login; the
additional definitions were not treated as accessible modules without a
visible route.

## Access and permission limits

- The current authenticated session rendered the routes above and retained the
  app shell while navigating.
- This establishes route visibility for this session only. It does not prove
  that every operation is authorized.
- No role/permission changes were made. Effective role permissions and
  differences between users remain unverified.
