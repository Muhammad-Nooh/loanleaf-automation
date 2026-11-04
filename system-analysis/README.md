# System Analysis Knowledge Base

This directory records black-box evidence gathered through authenticated
browser navigation, Playwright network observation, and API responses. Backend
source code is not available and is not required for this methodology. Each
finding distinguishes direct observation, inference, and unknowns. Credentials,
tokens, customer values, and database connection secrets are intentionally not
stored here.

## Application 1: LoanLeaf

- [Module inventory](./application-1/module-inventory.md)
- [Functional analysis](./application-1/functional-analysis.md)
- [Navigation map](./application-1/navigation-map.md)
- [Observed API inventory](./application-1/api-documentation.md)
- [Business workflows](./application-1/business-workflows.md)
- [Password-settings screenshot](./evidence/loanleaf-password-settings.png) (controls and account label masked)

## Application 2: CiiHive

- [Module inventory](./application-2/module-inventory.md)
- [Functional analysis](./application-2/functional-analysis.md)
- [Navigation map](./application-2/navigation-map.md)
- [Observed API inventory](./application-2/api-documentation.md)
- [Business workflows](./application-2/business-workflows.md)
- [Customer-registration screenshot](./evidence/ciihive-customer-registration.png) (form controls masked)

## Integration and cross-system notes

- [System architecture](./integration/system-architecture.md)
- [Initial integration flow](./integration/integration-flow.md)
- [API communication](./integration/api-communication.md)
- [Synchronization observations](./integration/data-synchronization.md)
- [Candidate shared identifiers](./integration/shared-identifiers.md)
- [End-to-end data flow](./integration/end-to-end-data-flow.md)
- [API behavior mapping](./api-behavior-mapping.md)
- [Frontend-to-API traceability](./frontend-to-api-traceability.md)
- [Observed integration flows](./observed-integration-flows.md)
- [Database-to-API field mapping](./database-api-field-mapping.md)
- [Black-box testing results](./black-box-testing-results.md)
- [Investigation limitations](./investigation-limitations.md)
- [Initial observed risks](./qa/identified-risks.md)
- [Reusable QA scenarios](./qa/test-scenarios.md)
- [Integration test cases](./qa/integration-test-cases.md)
- [Regression areas](./qa/regression-areas.md)
- [Intelligent recheck engine](./qa/recheck-engine.md)
- [Module dependency registry](./qa/dependency-registry.json)
- [Approved baseline status — LoanLeaf](./baselines/loanleaf.json)
- [Approved baseline status — CiiHive](./baselines/ciihive.json)
- [Historical execution reports](./reports/)
- [Database discovery status](./database/README.md)
- [Phase 1 environment findings](./phase-1-environment.md)
- [Progress tracker](./progress.md)

## Evidence limits

This is black-box UI/API observation, not a full business-process certification.
All visible LoanLeaf routes and CiiHive menu routes were opened without
submitting forms or performing transactions. The new Playwright observer
captures sanitized API structure, status, timing, and action association during
instrumented runs. Menu names, field labels, metadata, and API paths do not
prove backend implementation or database behavior. Database exploration
remains blocked pending dedicated read-only credentials and VPN/TLS
confirmation.
