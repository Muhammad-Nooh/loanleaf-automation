import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  aggregateApiObservations,
  candidateBaseline,
  compareApiBaseline,
  compareUiBaseline,
  selectTargets,
} from './qa-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(root, 'system-analysis', 'qa', 'dependency-registry.json');

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) throw new Error(`Unexpected argument "${argument}".`);
    const name = argument.slice(2);
    if (!['app', 'module', 'scope', 'change'].includes(name)) {
      throw new Error(`Unknown option "--${name}".`);
    }
    if (options[name] !== undefined) throw new Error(`Option "--${name}" may only be specified once.`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Option "--${name}" requires a value.`);
    options[name] = value;
    index += 1;
  }
  return options;
}

function timestampId(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

async function walkJsonFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkJsonFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath);
  }
  return files;
}

async function readJsonFiles(directory) {
  const files = await walkJsonFiles(directory);
  const results = [];
  for (const file of files) results.push(JSON.parse(await readFile(file, 'utf8')));
  return results;
}

function screenshotLinks(results, runDirectory) {
  return results.flatMap((result) => result.screenshotPath
    ? [path.relative(runDirectory, path.resolve(root, result.screenshotPath)).replaceAll(path.sep, '/')]
    : []);
}

function completeModules(targets) {
  return Object.entries(targets).flatMap(([app, modules]) =>
    modules.filter((module) => module.screens.length > 0 && !module.blockedScreenReason)
      .map((module) => `${app}:${module.name}`));
}

async function runPlaywright(selection, runDirectory) {
  const projects = Object.keys(selection.targets).map((app) => `--project=qa-${app}`);
  const cli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
  const env = {
    ...process.env,
    QA_REPORT_DIR: path.join(runDirectory, 'observations'),
    QA_TARGETS_JSON: JSON.stringify(Object.fromEntries(
      Object.entries(selection.targets).map(([app, modules]) => [app, modules.map((module) => module.id)]))),
  };
  await mkdir(env.QA_REPORT_DIR, { recursive: true });
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'test', ...projects, '--reporter=list'], {
      cwd: root,
      env,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({
      exitCode: code ?? (signal ? 1 : 0),
      signal,
    }));
  });
}

async function createRunDirectory() {
  const now = new Date();
  const directory = path.join(
    root,
    'system-analysis',
    'reports',
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    `${timestampId(now)}-${process.pid}`,
  );
  await mkdir(directory, { recursive: true });
  return directory;
}

async function processRun(selection, registry, runDirectory, playwrightResult) {
  const observationRoot = path.join(runDirectory, 'observations');
  const testResults = await readJsonFiles(observationRoot);
  const apiObservations = testResults.flatMap((result) => result.apiObservations ?? []);
  const uiScreens = testResults.flatMap((result) => result.uiScreen ? [result.uiScreen] : []);
  const apiByApp = {};
  const uiByApp = {};
  const comparisons = {};
  const candidates = {};
  const complete = completeModules(selection.targets);

  for (const app of Object.keys(selection.targets)) {
    apiByApp[app] = aggregateApiObservations(apiObservations.filter((item) => item.application === app));
    uiByApp[app] = uiScreens.filter((screen) => screen.application === app)
      .map(({ application, ...screen }) => screen)
      .sort((a, b) => `${a.module}|${a.route}`.localeCompare(`${b.module}|${b.route}`));
    const baseline = JSON.parse(await readFile(
      path.join(root, 'system-analysis', 'baselines', `${app}.json`), 'utf8'));
    const completedForApp = complete.filter((entry) => entry.startsWith(`${app}:`))
      .map((entry) => entry.slice(app.length + 1));
    const apiComparison = compareApiBaseline(apiByApp[app], baseline, completedForApp);
    const uiComparison = compareUiBaseline(uiByApp[app], baseline, completedForApp);
    comparisons[app] = {
      baselineVersion: baseline.baselineVersion,
      ...apiComparison,
      ...uiComparison,
    };
    candidates[app] = candidateBaseline(app, apiByApp[app], uiByApp[app], new Date().toISOString());
    await writeFile(
      path.join(runDirectory, `${app}-baseline-candidate.json`),
      `${JSON.stringify(candidates[app], null, 2)}\n`,
      'utf8',
    );
  }

  const selectedModules = Object.entries(selection.targets).flatMap(([app, modules]) =>
    modules.map((module) => ({ application: app, module: module.name })));
  const dependencyMap = Object.entries(selection.targets).flatMap(([application, modules]) =>
    modules.map((module) => ({
      application,
      module: module.name,
      screens: module.screens,
      apiFamilies: module.apiFamilies,
      workflows: module.workflowEvidence,
      integrationPoints: module.integrationPoints,
      databaseEntities: module.databaseEntities,
      databaseEntityEvidenceStatus: module.databaseEntities.length
        ? 'verified entries only'
        : 'unknown; no database entity has been verified',
      testCases: module.testCases,
    })));
  const blockedModules = selectedModules.flatMap(({ application, module }) => {
    const config = selection.targets[application].find((item) => item.name === module);
    return config.blockedScreenReason ? [{
      application,
      module,
      reason: config.blockedScreenReason,
    }] : [];
  });
  const failedTests = testResults.filter((result) => result.outcome === 'failed');
  const passedTests = testResults.filter((result) => result.outcome === 'passed');
  const moduleTestCount = Object.values(selection.targets)
    .flat()
    .reduce((count, module) => count + Math.max(module.screens.length, 1), 0);
  const expectedTestCount = moduleTestCount + Object.keys(selection.targets).length;
  const missingTests = Math.max(0, expectedTestCount - testResults.length);
  const apiChanges = Object.values(comparisons).flatMap((comparison) => comparison.apiChanges ?? []);
  const uiChanges = Object.values(comparisons).flatMap((comparison) => comparison.uiChanges ?? []);
  const potentialRegressions = [...apiChanges, ...uiChanges]
    .filter((change) => change.classification === 'potential-regression');
  const crossApplicationApiHostRequests = apiObservations.flatMap((observation) => {
    if (observation.trafficType !== 'external-browser-api') return [];
    const otherApp = observation.application === 'loanleaf' ? 'ciihive' : 'loanleaf';
    const knownOtherAppHosts = registry.applications[otherApp].apiHosts;
    return knownOtherAppHosts.includes(observation.host) ? [{
      sourceApplication: observation.application,
      destinationHost: observation.host,
      method: observation.method,
      path: observation.path,
      module: observation.module,
      evidence: 'browser request reached a host previously observed as the other application API host; backend-to-backend integration is not established',
    }] : [];
  });
  const report = {
    schemaVersion: 1,
    executionStatus: playwrightResult.exitCode ? 'failed' : missingTests ? 'incomplete' : 'completed',
    executionTimestamp: new Date().toISOString(),
    command: process.argv.slice(2),
    changeDescription: selection.change,
    selectedApplications: Object.keys(selection.targets),
    selectedModules,
    dependencyMap,
    tests: {
      executed: testResults.map((result) => ({
        application: result.application,
        module: result.module,
        screen: result.screen,
        outcome: result.outcome,
        coverageStatus: result.coverageStatus,
      })),
      passed: passedTests.length,
      failed: failedTests.length + missingTests
        + (playwrightResult.exitCode && !testResults.some((result) => result.outcome === 'failed') ? 1 : 0),
      expected: expectedTestCount,
      missing: missingTests,
      playwrightExitCode: playwrightResult.exitCode,
    },
    apiChanges,
    uiChanges,
    potentialRegressions,
    integrationEvidence: {
      status: crossApplicationApiHostRequests.length ? 'cross-application-api-host-request-observed' : 'no-cross-application-api-host-request-observed-in-this-run',
      crossApplicationApiHostRequests,
      conclusion: 'A browser request to a host used by the other application is not sufficient to prove backend-to-backend integration or shared persistence.',
    },
    baselines: Object.fromEntries(Object.entries(comparisons)
      .map(([app, comparison]) => [app, comparison.baselineStatus])),
    baselineCandidates: Object.keys(candidates)
      .map((app) => `${app}-baseline-candidate.json`),
    screenshots: screenshotLinks(testResults, runDirectory),
    blockers: [
      ...blockedModules.map((item) => `${item.application} / ${item.module}: ${item.reason}`),
      ...selection.mappingNotes,
      'Database-backed checks are blocked until dedicated read-only access and connection requirements are confirmed.',
      ...(selection.integrationScope
        ? ['No cross-application API-host request or correlated record was observed in this run; integration status remains unknown.']
        : []),
      ...Object.entries(comparisons)
        .filter(([, comparison]) => comparison.baselineStatus !== 'approved')
        .map(([app]) => `${app} has no approved baseline; differences are candidates for review, not regressions against an approved snapshot.`),
    ],
    recommendations: [
      'Review each baseline candidate and manually approve only after confirming expected UI/API behavior.',
      'Use a non-production environment and explicit authorization before running state-changing scenarios.',
      'Provide authorized read-only DB access before claiming API-to-database mappings or cross-application record correlation.',
    ],
    apiObservations,
    uiScreens: uiByApp,
  };
  await writeFile(path.join(runDirectory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    const registry = JSON.parse(await readFile(registryPath, 'utf8'));
    const selection = selectTargets(options, registry);
    const runDirectory = await createRunDirectory();
    console.log(`QA report directory: ${path.relative(root, runDirectory)}`);
    console.log(`Selected: ${JSON.stringify(selection.selectedModuleNames)}`);
    const playwrightResult = await runPlaywright(selection, runDirectory);
    const report = await processRun(selection, registry, runDirectory, playwrightResult);
    console.log(`QA summary: ${report.tests.passed} passed, ${report.tests.failed} failed.`);
    console.log(`API changes: ${report.apiChanges.length}; UI changes: ${report.uiChanges.length}; potential regressions: ${report.potentialRegressions.length}.`);
    console.log(`Historical report: ${path.relative(root, path.join(runDirectory, 'report.json'))}`);
    if (playwrightResult.exitCode !== 0 || report.tests.failed > 0) process.exitCode = playwrightResult.exitCode || 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'QA runner failed.');
    process.exitCode = 1;
  }
}

await main();
