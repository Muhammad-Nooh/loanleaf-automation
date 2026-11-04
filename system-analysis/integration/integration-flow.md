# Initial Integration Flow

## Observed flow surfaces

```text
LoanLeaf browser
  → LoanLeaf UI routes (customer / loan / pending workflow screens)
  → APIs on ebdaa.mfsys.com.pk
  → loan, security, configuration, deposit, and general-ledger endpoints
  → persistence destination: not verified

CiiHive browser
  → CiiHive UI routes (CRM / loan / approval / operational screens)
  → APIs on www.ebdaa.mfsys.com.pk
  → CRM, loan, deposit, general-ledger, security, configuration, and report endpoints
  → persistence destination: not verified
```

## Proposed business handoff (unverified)

The repository README describes an intended chain in which a customer and loan
are created in LoanLeaf and then verified/approved in CiiHive. Visible LoanLeaf
review queues and CiiHive CRM/Loan registration and approval menus are
consistent with that intention.

**No actual record handoff was traced.** No transaction was created, no
identifier was correlated across the two UIs, and no integration request,
queue message, or database row was observed that proves this flow.

## Reverse direction

No CiiHive-to-LoanLeaf callback, webhook, or reverse status update was observed
during read-only navigation. The direction and synchronization mechanism
remain unknown.

See [candidate identifiers](./shared-identifiers.md) and
[API communication](./api-communication.md) for what can be investigated
after a safe, existing test record and approved read-only database access are
available.

The current UI/API evidence and configured CiiHive workflow hooks are
consolidated in [end-to-end-data-flow.md](./end-to-end-data-flow.md); it
explicitly marks service execution, persistence, and cross-app synchronization
as unverified.
