import test from 'node:test';
import assert from 'node:assert/strict';
import registry from '../../system-analysis/qa/dependency-registry.json' with { type: 'json' };
import {
  aggregateApiObservations,
  candidateBaseline,
  compareApiBaseline,
  compareUiBaseline,
  selectTargets,
} from '../../scripts/qa-engine.mjs';

test('selects a LoanLeaf module by user-facing name', () => {
  const selection = selectTargets({ app: 'loanleaf', module: 'Loan Management' }, registry);
  assert.deepEqual(selection.selectedModuleNames.loanleaf, ['Loan Management']);
});

test('accepts the documented CiiHive command alias', () => {
  const selection = selectTargets({ app: 'cihive', module: 'Customer Registration' }, registry);
  assert.deepEqual(selection.selectedModuleNames.ciihive, ['Customer Registration']);
});

test('maps change descriptions to evidenced module dependencies', () => {
  const selection = selectTargets({ change: 'Updated customer registration form' }, registry);
  assert.deepEqual(selection.selectedModuleNames.ciihive, ['Customer Registration']);
  assert.deepEqual(selection.selectedModuleNames.loanleaf, ['Customer Profile']);
});

test('rejects unknown modules rather than silently running unrelated checks', () => {
  assert.throws(
    () => selectTargets({ app: 'loanleaf', module: 'Imaginary module' }, registry),
    /Unknown loanleaf module/,
  );
});

test('aggregates only the configured application API host and keeps payload values out', () => {
  const entries = aggregateApiObservations([
    {
      application: 'ciihive', module: 'Customer Registration',
      trafficType: 'application-api', host: 'www.ebdaa.mfsys.com.pk',
      method: 'POST', path: '/crm/mongodb/lazylist', queryKeys: ['formId'],
      requestPayloadShape: { filter: { CMP_CUSTNAME: '<string>' } },
      responsePayloadShape: [{ CMP_CUSTCODE: '<string>' }],
      status: 200, durationMs: 120, authenticationBehavior: 'session-request',
    },
    {
      application: 'ciihive', module: 'Customer Registration',
      trafficType: 'external-browser-api', host: 'maps.googleapis.com',
      method: 'GET', path: '/maps/api/mapsjs/gen_204', queryKeys: [],
      status: 200, durationMs: 50, authenticationBehavior: 'unknown',
    },
  ]);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].requestParameterNames, ['filter', 'formId']);
  assert.equal(JSON.stringify(entries).includes('secret-customer-name'), false);
});

test('does not treat an unapproved baseline as an approved comparison', () => {
  const current = aggregateApiObservations([{
    application: 'loanleaf', module: 'Loan Management',
    trafficType: 'application-api', host: 'ebdaa.mfsys.com.pk',
    method: 'GET', path: '/loan/mongodb/lazylist', queryKeys: [],
    status: 200, durationMs: 100, authenticationBehavior: 'session-request',
  }]);
  const candidate = candidateBaseline('loanleaf', current, [], '2026-11-04T00:00:00.000Z');
  assert.equal(candidate.approvalStatus, 'candidate-awaiting-manual-approval');
  assert.equal(compareApiBaseline(current, candidate).baselineStatus, 'not-approved');
});

test('detects an unexpected HTTP error against an approved baseline', () => {
  const baseline = {
    approvalStatus: 'approved',
    expectedChanges: [],
    apiEndpoints: [{
      key: 'Loan Management|ebdaa.mfsys.com.pk|GET|/loan/mongodb/lazylist',
      module: 'Loan Management', requestParameterNames: [], requestPayloadShapes: [],
      responsePayloadShapes: [], statusCodes: [200],
      responseDurationMs: { median: 100 },
    }],
  };
  const current = [{
    key: 'Loan Management|ebdaa.mfsys.com.pk|GET|/loan/mongodb/lazylist',
    module: 'Loan Management', requestParameterNames: [], requestPayloadShapes: [],
    responsePayloadShapes: [], statusCodes: [200, 500],
    responseDurationMs: { median: 100 },
  }];
  const comparison = compareApiBaseline(current, baseline);
  assert.ok(comparison.apiChanges.some((change) =>
    change.kind === 'http-status' && change.classification === 'potential-regression'));
});

test('detects request, response, and latency changes against an approved baseline', () => {
  const key = 'Loan Management|ebdaa.mfsys.com.pk|POST|/loan/mongodb/lazylist';
  const baseline = {
    approvalStatus: 'approved',
    expectedChanges: [],
    apiEndpoints: [{
      key, module: 'Loan Management',
      requestParameterNames: ['filter'], requestPayloadShapes: [{ filter: '<object>' }],
      responsePayloadShapes: [{ options: [] }], statusCodes: [200],
      responseDurationMs: { median: 1000 }, authenticationBehaviors: ['session-request'],
      networkFailureCodes: [],
    }],
  };
  const current = [{
    key, module: 'Loan Management',
    requestParameterNames: ['filter', 'limit'], requestPayloadShapes: [{ filter: '<object>', limit: '<number>' }],
    responsePayloadShapes: [{ results: [] }], statusCodes: [200],
    responseDurationMs: { median: 2200 }, authenticationBehaviors: ['session-request'],
    networkFailureCodes: [],
  }];
  const changes = compareApiBaseline(current, baseline).apiChanges;
  assert.ok(changes.some((change) => change.kind === 'request-structure'));
  assert.ok(changes.some((change) => change.kind === 'response-structure'));
  assert.ok(changes.some((change) => change.kind === 'response-time'));
});

test('reports removed endpoints only for completely rechecked modules', () => {
  const baseline = {
    approvalStatus: 'approved',
    expectedChanges: [],
    apiEndpoints: [{
      key: 'Loan Management|ebdaa.mfsys.com.pk|GET|/loan/metadata',
      module: 'Loan Management', statusCodes: [200],
    }],
  };
  assert.equal(compareApiBaseline([], baseline, []).apiChanges.length, 0);
  assert.equal(compareApiBaseline([], baseline, ['Loan Management']).apiChanges[0].kind, 'removed-endpoint');
});

test('detects sanitized UI structure changes', () => {
  const baseline = {
    approvalStatus: 'approved',
    expectedChanges: [],
    uiScreens: [{
      module: 'Customer Profile', route: '/home/loan/customerProfile',
      structure: { controls: { inputs: 2 } },
    }],
  };
  const comparison = compareUiBaseline([{
    module: 'Customer Profile', route: '/home/loan/customerProfile',
    structure: { controls: { inputs: 3 } },
  }], baseline);
  assert.ok(comparison.uiChanges.some((change) => change.kind === 'ui-structure'));
});
