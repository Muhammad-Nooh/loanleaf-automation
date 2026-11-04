import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function saveRunTestResult(
  application: 'loanleaf' | 'ciihive',
  module: string,
  screen: string,
  outcome: 'passed' | 'failed',
): Promise<void> {
  const reportDirectory = process.env.QA_REPORT_DIR;
  if (!reportDirectory) return;
  const outputDirectory = path.join(reportDirectory, 'observations', application, '_setup');
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, `${module.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.json`), `${JSON.stringify({
    application,
    module,
    screen,
    outcome,
    coverageStatus: 'setup',
  }, null, 2)}\n`, 'utf8');
}
