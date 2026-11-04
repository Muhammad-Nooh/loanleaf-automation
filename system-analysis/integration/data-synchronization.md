# Data Synchronization: Current Evidence

## Verified

- Both UIs expose CRM/customer and loan-related screens.
- Both call APIs with corresponding security, loan, organization, and workflow
  concepts.
- The two UI/API hostnames resolved to a common address during this
  investigation. This is address-level hosting overlap, not proof of shared
  application code, database, or record synchronization.
- CiiHive's observed configuration API response schema includes
  `replicateTopics`, `defaultTopic`, and `sqlDB` fields for replicated-form
  configuration.
- CiiHive customer form metadata configures the customer registration workflow
  to advance to customer authorization; the authorization form declares a
  `CREATE_CUSTOMER_PROFILE` hook. Individual-loan create/authorization
  metadata declares `SAVE_WORKFLOW_NUMBER`, `UPDATE_LOAN_ACCOUNT`, and
  `OPEN_LOAN_ACCOUNT` hooks at the corresponding configured operations.
- A CiiHive loan lazy-list response schema included field names such as
  `CMP_CUSTCODE`, `PIT_IDENVALUE`, `DMP_PRODCODE`, `applicationStatus`, and
  `workFlowRefNum`. Values were not retained.

## Not established

- Whether LoanLeaf creates records directly in CiiHive's data store.
- Whether a REST service, event/topic, scheduled process, or direct database
  operation moves records between applications.
- The source of truth for customer, application, loan, and status values.
- Retry, idempotency, duplicate prevention, failure recovery, or reverse
  synchronization behavior.
- Whether CiiHive's replication configuration is used for this particular
  LoanLeaf flow.
- Whether the configured CiiHive hooks run, which services implement them, or
  which database objects they read/write. Metadata was inspected but the hooks
  were not executed.

The repository's described business chain is an intended workflow, not proof
of the production synchronization mechanism. A safe correlation requires an
already-existing approved test record or an explicitly authorized test
transaction plus read-only access.
