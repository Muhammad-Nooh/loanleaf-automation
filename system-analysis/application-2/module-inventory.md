# CiiHive Module Inventory

**Evidence status:** 177 distinct visible menu-route targets were found in the
authenticated session and opened as client-side routes. Menu items below are
the observed labels; repeated labels can have different operation/form routes.
No forms or transactions were submitted.

| Module/menu group | Route targets | Visible functions/screens |
|---|---:|---|
| Designer | 6 | Module Designer, Form Designer, Submodule Designer, Workflow Designer, Report Designer, Menu Designer |
| CRM | 18 | Individual Customer, Business Customer, Freez Accounts, Unfreeze Account, Block, Unblock, Follow Up, Freeze Account, UnBlock, Customer Blacklisting, Customer Whitelist, Unclose Customer, Client Evaluation, Mark Close Application |
| Loan | 50 | Individual Loan, Group Loan, Collaterals, Credit Committee, Register Groups, Mocked Loan Schedule, Loan Restructure, Charges Waiver, Setting Monthly Targets, Loan Account Rate, Loan Charges Waiver, Loan Closure, Write Off, Loan Reschedule, Edit Loan Schedule, Loan Appeal Application, Early Settlement Apply/Authorize, Cheque Management, Edit Cheque Management, Loan Promissory Note, Loan Marking Status, Loan Follow Up, Installment Deferment Creation/Authorization, Loan Bulk FollowUp, Manual, Up Front Fee, Service Fee, Top-Up, Write Off Income, Loan Authorization, Loan Cancellation, Loan Accounting Matrix |
| Deposit | 38 | Individual/Business account operations, Deposit Account Rate, Charge Exemption, Individual/Business Account approval, Audit, Individual/Business TDR, Cash Deposit, Cash Withdrawal, TDR Issuance, TDR Encashment, Account Account, Deposit Closure, Profit Posting, Early Encashment, Account - GL, GL - Account, One to Many Transactions, Excel Upload Transaction, Loan Bulk Upload, Deposit Authorization, Deposit Cancellation, Receive Instrument, Issue Cheque Book, Mark Leaf Status, Mark Instrument Status, SOC, Deposit Accounting Matrix, SOC Inquiry |
| Term Deposit | 3 | TDR Account, Business TDR, Audit |
| General Ledger | 16 | Open Batch, Replenishment, Cash to Vault, Close Batch, Batch Verification, GL - GL, Excel Upload (GL-GL), Bulk GL Upload, Creation, Modification, Authorization, General Ledger Authorization, General Ledger Reversal, General Ledger, COA, GL Matrix |
| User Batch Management | 4 | Open Batch, Replenishment, Close Batch, Cash to Vault |
| Reversal | 2 | Loan Reversal, Deposit Reversal |
| Instrument Management | 1 | Approval |
| Security activity | 2 | User Activity Allocation, Role Activity Allocation |
| Security | 6 | Add / Update User, KPI Allocation, Global Device Configuration, Device Registration, Geographic Group, Geolocation Inquiry |
| Product | 4 | Loan Product, Deposit Product |
| Configuration | 22 | Branch Registration, Exchange Rate, Update Branch, Replication Synchronization, Blacklist Replication Synchronization, Subbranch Setup, SMS Activation, Custom SMS, SOC Create, SOC Update, Company Registration, Update Company, Functionality Allocation, Close Day, Close Online, End of Year, Close Branch Operation, Yearly Processes, Daily Process, International Blacklisting, National Blacklisting, Backup Utility |
| Bank Setup | 1 | Branch Registration |
| Company | 1 | Company Workflow |
| Notification | 3 | Message Setup, Reminder Setup, Loan Reminder SMS |
| **Total** | **177** | Visible distinct menu-route targets |

## Route patterns observed

- Designer screens use `#/home/module`, `#/home/form`, `#/home/submodule`,
  `#/home/workflow`, `#/home/reportdesigner`, and `#/home/menu`.
- Many CRM/security/configuration forms use `#/home/dynamic` with `moduleId`,
  `formId`, and an operation such as `create`, `update`, or `nonwizard`.
- Approval screens use `#/home/approval` with module/form identifiers.
- Loan, deposit, and transaction routes also use dedicated `global` and
  transaction-specific route paths.

The public `assets/data/app.uri.json` manifest lists Security, Report,
Configuration, CRM, Deposit, Loan, General Ledger, Static, Notification,
Credit Scoring, and MConnect URI groups. The manifest's page-definition counts
are not treated as user-accessible screens; the 177 targets above came from
the authenticated visible menu.

## Permission scope

This inventory means the current login rendered these menu routes. It does not
prove that create/update/approve functions are authorized. The observed
individual customer create wizard had required-looking labels and disabled
native inputs while its Next action was enabled; the exact cause (role,
workflow state, or form behavior) was not established.
