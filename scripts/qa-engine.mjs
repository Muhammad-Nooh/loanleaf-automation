import { createHash } from 'node:crypto';

export function normalize(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}

export function selectTargets(options, registry) {
  const applicationAliases = new Map([
    ['loanleaf', 'loanleaf'],
    ['ciihive', 'ciihive'],
    ['cihive', 'ciihive'],
    ['cii hive', 'ciihive'],
  ]);
  const requestedApp = options.app ? applicationAliases.get(normalize(options.app)) : undefined;
  if (options.app && !requestedApp) {
    throw new Error(`Unknown app "${options.app}". Use loanleaf or cihive.`);
  }
  if (options.scope && options.scope !== 'integration') {
    throw new Error(`Unknown scope "${options.scope}". Use integration.`);
  }
  if (options.scope === 'integration' && (options.app || options.module || options.change)) {
    throw new Error('--scope integration cannot be combined with --app, --module, or --change.');
  }
  if (options.module && !requestedApp) {
    throw new Error('--module requires --app.');
  }
  if (options.change && (requestedApp || options.module || options.scope)) {
    throw new Error('--change cannot be combined with --app, --module, or --scope.');
  }

  const allApps = Object.keys(registry.applications);
  const selectedApps = requestedApp ? [requestedApp] : allApps;
  const targets = {};
  const mappingNotes = [];

  if (options.module) {
    const app = registry.applications[requestedApp];
    const match = app.modules.find((module) => [module.name, module.id, ...(module.aliases ?? [])]
      .some((alias) => normalize(alias) === normalize(options.module)));
    if (!match) {
      const available = app.modules.map((module) => module.name).join(', ');
      throw new Error(`Unknown ${requestedApp} module "${options.module}". Available modules: ${available}.`);
    }
    targets[requestedApp] = [match];
  } else if (options.change) {
    const changeText = normalize(options.change);
    for (const appName of allApps) {
      const matching = registry.applications[appName].modules.filter((module) =>
        [module.name, module.id, ...(module.aliases ?? []), ...(module.keywords ?? [])]
          .some((term) => normalize(term).length > 2 && changeText.includes(normalize(term))));
      if (matching.length) targets[appName] = matching;
    }
    if (!Object.keys(targets).length) {
      mappingNotes.push('Change text did not map to known module keywords; running all registered read-only checks.');
      for (const appName of allApps) targets[appName] = registry.applications[appName].modules;
    }
  } else {
    for (const appName of selectedApps) targets[appName] = registry.applications[appName].modules;
  }

  const integrationScope = options.scope === 'integration';
  return {
    targets,
    integrationScope,
    change: options.change ?? null,
    mappingNotes,
    selectedModuleNames: Object.fromEntries(Object.entries(targets)
      .map(([app, modules]) => [app, modules.map((module) => module.name)])),
  };
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function stableString(value) {
  return JSON.stringify(stable(value) ?? null);
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function setValues(values) {
  return [...new Set(values.map((value) => stableString(value)))].sort();
}

export function aggregateApiObservations(observations) {
  const groups = new Map();
  for (const observation of observations) {
    if (observation.trafficType !== 'application-api') continue;
    const module = observation.module || 'Unclassified';
    const key = [module, observation.host, observation.method, observation.path].join('|');
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        module,
        host: observation.host,
        method: observation.method,
        path: observation.path,
        queryParameterNames: [],
        requestPayloadShapes: [],
        responsePayloadShapes: [],
        statusCodes: [],
        responseDurationsMs: [],
        authenticationBehaviors: [],
        networkFailureCodes: [],
        errorResponses: [],
        observations: 0,
      };
      groups.set(key, group);
    }
    group.observations += 1;
    group.queryParameterNames.push(...(observation.queryKeys ?? []));
    if (observation.requestPayloadShape !== undefined) group.requestPayloadShapes.push(observation.requestPayloadShape);
    if (observation.responsePayloadShape !== undefined) group.responsePayloadShapes.push(observation.responsePayloadShape);
    if (observation.status !== undefined) group.statusCodes.push(observation.status);
    if (observation.durationMs !== undefined) group.responseDurationsMs.push(observation.durationMs);
    group.authenticationBehaviors.push(observation.authenticationBehavior ?? 'unknown');
    if (observation.failed) group.networkFailureCodes.push(observation.failureCode ?? 'OTHER');
    if ((observation.status ?? 0) >= 400) {
      group.errorResponses.push({
        status: observation.status,
        shape: observation.errorResponseShape ?? observation.responsePayloadShape ?? null,
      });
    }
  }

  return [...groups.values()].map((group) => {
    const requestKeys = group.requestPayloadShapes.flatMap((shape) =>
      shape && typeof shape === 'object' && !Array.isArray(shape) ? Object.keys(shape) : []);
    const durations = group.responseDurationsMs;
    return {
      key: group.key,
      module: group.module,
      host: group.host,
      method: group.method,
      path: group.path,
      requestParameterNames: [...new Set([...group.queryParameterNames, ...requestKeys])].sort(),
      queryParameterNames: [...new Set(group.queryParameterNames)].sort(),
      requestPayloadShapes: setValues(group.requestPayloadShapes).map((value) => JSON.parse(value)),
      responsePayloadShapes: setValues(group.responsePayloadShapes).map((value) => JSON.parse(value)),
      statusCodes: [...new Set(group.statusCodes)].sort((a, b) => a - b),
      responseDurationMs: {
        sampleCount: durations.length,
        median: median(durations),
        min: durations.length ? Math.min(...durations) : null,
        max: durations.length ? Math.max(...durations) : null,
      },
      authenticationBehaviors: [...new Set(group.authenticationBehaviors)].sort(),
      networkFailureCodes: [...new Set(group.networkFailureCodes)].sort(),
      errorResponses: group.errorResponses,
      observationCount: group.observations,
    };
  }).sort((a, b) => a.key.localeCompare(b.key));
}

function isExpectedChange(baseline, key, kind) {
  const now = Date.now();
  return (baseline.expectedChanges ?? []).some((change) =>
    change.apiKey === key
    && change.kind === kind
    && (!change.expiresAt || Date.parse(change.expiresAt) >= now));
}

function changeRecord(key, kind, classification, details) {
  return { key, kind, classification, details };
}

export function compareApiBaseline(currentEntries, baseline, completeModules = []) {
  if (baseline.approvalStatus !== 'approved') {
    return {
      baselineStatus: 'not-approved',
      apiChanges: currentEntries.map((entry) => changeRecord(
        entry.key,
        'candidate-endpoint',
        'blocked-or-unverified',
        `No approved baseline exists for ${entry.method} ${entry.host}${entry.path}.`,
      )),
    };
  }

  const previous = new Map((baseline.apiEndpoints ?? []).map((entry) => [entry.key, entry]));
  const current = new Map(currentEntries.map((entry) => [entry.key, entry]));
  const changes = [];

  for (const [key, entry] of current) {
    const old = previous.get(key);
    if (!old) {
      changes.push(changeRecord(key, 'new-endpoint',
        isExpectedChange(baseline, key, 'new-endpoint') ? 'expected-change' : 'new-behavior-requiring-review',
        'Endpoint was not present in the approved baseline.'));
      const errorStatuses = entry.statusCodes.filter((status) => status >= 400);
      if (errorStatuses.length) {
        changes.push(changeRecord(key, 'unexpected-http-error', 'potential-regression',
          `New endpoint returned HTTP error status code(s): ${errorStatuses.join(', ')}.`));
      }
      continue;
    }
    if (stableString(entry.requestParameterNames) !== stableString(old.requestParameterNames)
      || stableString(entry.requestPayloadShapes) !== stableString(old.requestPayloadShapes)) {
      changes.push(changeRecord(key, 'request-structure',
        isExpectedChange(baseline, key, 'request-structure') ? 'expected-change' : 'unexpected-change',
        'Request parameter names or payload structure changed.'));
    }
    if (stableString(entry.responsePayloadShapes) !== stableString(old.responsePayloadShapes)) {
      changes.push(changeRecord(key, 'response-structure',
        isExpectedChange(baseline, key, 'response-structure') ? 'expected-change' : 'potential-regression',
        'Response payload structure changed.'));
    }
    const newStatuses = entry.statusCodes.filter((status) => !old.statusCodes.includes(status));
    if (newStatuses.length) {
      const hasError = newStatuses.some((status) => status >= 400);
      changes.push(changeRecord(key, 'http-status',
        hasError ? 'potential-regression' : 'unexpected-change',
        `Newly observed HTTP status code(s): ${newStatuses.join(', ')}.`));
    }
    if (stableString(entry.authenticationBehaviors) !== stableString(old.authenticationBehaviors)) {
      const rejected = entry.authenticationBehaviors.includes('rejected');
      changes.push(changeRecord(key, 'authentication-behavior',
        rejected ? 'potential-regression' : 'unexpected-change',
        `Observed authentication behavior changed from ${stableString(old.authenticationBehaviors)} to ${stableString(entry.authenticationBehaviors)}.`));
    }
    const newFailureCodes = (entry.networkFailureCodes ?? [])
      .filter((code) => !(old.networkFailureCodes ?? []).includes(code));
    if (newFailureCodes.length) {
      changes.push(changeRecord(key, 'network-failure', 'potential-regression',
        `Newly observed network failure code(s): ${newFailureCodes.join(', ')}.`));
    }
    const oldMedian = old.responseDurationMs?.median;
    const currentMedian = entry.responseDurationMs?.median;
    if (oldMedian !== null && oldMedian !== undefined && currentMedian !== null
      && currentMedian - oldMedian >= 1000 && currentMedian >= oldMedian * 2) {
      changes.push(changeRecord(key, 'response-time',
        isExpectedChange(baseline, key, 'response-time') ? 'expected-change' : 'potential-regression',
        `Median duration increased from ${oldMedian}ms to ${currentMedian}ms.`));
    }
  }

  for (const [key, entry] of previous) {
    if (current.has(key) || !completeModules.includes(entry.module)) continue;
    changes.push(changeRecord(key, 'removed-endpoint',
      isExpectedChange(baseline, key, 'removed-endpoint') ? 'expected-change' : 'potential-regression',
      `Endpoint from the approved baseline was not observed in the complete module recheck (${entry.method} ${entry.host}${entry.path}).`));
  }

  return { baselineStatus: 'approved', apiChanges: changes };
}

export function compareUiBaseline(currentScreens, baseline, completeModules = []) {
  if (baseline.approvalStatus !== 'approved') {
    return {
      baselineStatus: 'not-approved',
      uiChanges: currentScreens.map((screen) => changeRecord(
        `${screen.module}|${screen.route}`,
        'candidate-ui-screen',
        'blocked-or-unverified',
        'No approved UI baseline exists for this route.',
      )),
    };
  }
  const previous = new Map((baseline.uiScreens ?? []).map((screen) =>
    [`${screen.module}|${screen.route}`, screen]));
  const current = new Map(currentScreens.map((screen) =>
    [`${screen.module}|${screen.route}`, screen]));
  const changes = [];
  const expected = (key, kind) => (baseline.expectedChanges ?? []).some((change) =>
    change.screenRoute === key && change.kind === kind
    && (!change.expiresAt || Date.parse(change.expiresAt) >= Date.now()));
  for (const [key, screen] of current) {
    const old = previous.get(key);
    if (!old) {
      changes.push(changeRecord(key, 'new-ui-screen',
        expected(screen.route, 'new-ui-screen') ? 'expected-change' : 'new-behavior-requiring-review',
        'Route was not present in the approved UI baseline.'));
    } else if (stableString(screen.structure) !== stableString(old.structure)) {
      changes.push(changeRecord(key, 'ui-structure',
        expected(screen.route, 'ui-structure') ? 'expected-change' : 'potential-regression',
        'Sanitized semantic DOM counts changed.'));
    }
  }
  for (const [key, screen] of previous) {
    if (!current.has(key) && completeModules.includes(screen.module)) {
      changes.push(changeRecord(key, 'removed-ui-screen',
        expected(screen.route, 'removed-ui-screen') ? 'expected-change' : 'potential-regression',
        'Route from the approved baseline was not observed in a complete module recheck.'));
    }
  }
  return { baselineStatus: 'approved', uiChanges: changes };
}

export function candidateBaseline(application, apiEndpoints, uiScreens, capturedAt) {
  return {
    schemaVersion: 1,
    application,
    baselineVersion: 0,
    approvalStatus: 'candidate-awaiting-manual-approval',
    capturedAt,
    approvedAt: null,
    approvedBy: null,
    apiEndpoints,
    uiScreens,
    expectedChanges: [],
    contentSha256: createHash('sha256')
      .update(stableString({ apiEndpoints, uiScreens }))
      .digest('hex'),
    note: 'Generated candidate only. Review and manually approve; the QA runner never promotes candidates to approved baselines.',
  };
}
