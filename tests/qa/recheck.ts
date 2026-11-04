import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import registry from '../../system-analysis/qa/dependency-registry.json';
import { ciihive, loanleaf } from '../../src/core/env';
import { NetworkObserver } from '../../src/core/network-observer';

type AppName = 'loanleaf' | 'ciihive';
type ModuleConfig = typeof registry.applications.loanleaf.modules[number]
  | typeof registry.applications.ciihive.modules[number];
type ScreenConfig = { name: string; route: string };

export function registerRechecks(appName: AppName): void {
  const targets = process.env.QA_TARGETS_JSON
    ? JSON.parse(process.env.QA_TARGETS_JSON) as Partial<Record<AppName, string[]>>
    : undefined;
  const appModules = registry.applications[appName].modules as ModuleConfig[];
  const selectedIds = targets?.[appName];
  const modules = selectedIds
    ? appModules.filter((module) => selectedIds.includes(module.id))
    : appModules;

  for (const module of modules) {
    const screens = module.screens as ScreenConfig[];
    const recheckScreens: Array<ScreenConfig | undefined> = screens.length ? screens : [undefined];
    for (const screen of recheckScreens) {
      const screenName = screen?.name ?? 'Authenticated shell (screen route unmapped)';
      test(`[${appName}] ${module.name} :: ${screenName}`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== `qa-${appName}`, 'Executed by the QA recheck command only.');
        const observer = new NetworkObserver(page, {
          application: appName,
          module: module.name,
        });
        observer.start();
        const baseUrl = appName === 'loanleaf' ? loanleaf.url : ciihive.url;
        const targetUrl = screen?.route
          ? new URL(screen.route, baseUrl).toString()
          : new URL('/', baseUrl).toString();
        const navigation = await Promise.allSettled([
          observer.withAction(`open ${module.name} / ${screenName}`, () => page.goto(targetUrl)),
        ]);
        const navigationSucceeded = navigation[0].status === 'fulfilled';
        await page.waitForTimeout(500);

        const currentUrl = new URL(page.url());
        const authenticated = appName === 'loanleaf'
          ? !/\/auth\/login/i.test(currentUrl.pathname)
          : !/#\/login/i.test(currentUrl.hash);
        const structure = await page.locator('body').evaluate((body) => {
          const tagCounts: Record<string, number> = {};
          const roleCounts: Record<string, number> = {};
          for (const element of Array.from(body.querySelectorAll('*'))) {
            const tag = element.tagName.toLowerCase();
            tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
            const role = element.getAttribute('role');
            if (role) roleCounts[role] = (roleCounts[role] ?? 0) + 1;
          }
          return {
            tagCounts: Object.fromEntries(Object.entries(tagCounts).sort(([a], [b]) => a.localeCompare(b))),
            roleCounts: Object.fromEntries(Object.entries(roleCounts).sort(([a], [b]) => a.localeCompare(b))),
            fieldLabels: Array.from(body.querySelectorAll('label'))
              .map((label) => (label.textContent ?? '').trim())
              .filter(Boolean)
              .sort(),
            navigationRoutes: Array.from(body.querySelectorAll('a[href]'))
              .filter((link) => link.closest('nav,[role="navigation"]') !== null)
              .map((link) => {
                const rawHref = link.getAttribute('href') ?? '';
                try {
                  const parsed = new URL(rawHref, location.origin);
                  return parsed.hash ? parsed.hash.split('?')[0] : parsed.pathname;
                } catch {
                  return 'unparseable-route';
                }
              })
              .filter((route) => route.startsWith('/') || route.startsWith('#/'))
              .sort(),
            formFields: Array.from(body.querySelectorAll('input,select,textarea'))
              .map((control) => {
                const field = control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                return {
                  tag: field.tagName.toLowerCase(),
                  type: field instanceof HTMLInputElement ? field.type : field.tagName.toLowerCase(),
                  name: field.getAttribute('name'),
                  required: field.required || field.getAttribute('aria-required') === 'true',
                  disabled: field.disabled,
                };
              })
              .sort((a, b) => `${a.tag}|${a.type}|${a.name}`.localeCompare(`${b.tag}|${b.type}|${b.name}`)),
            validationMessageCount: body.querySelectorAll('[role="alert"],[aria-live="assertive"],[aria-live="polite"]').length,
            controls: {
              buttons: body.querySelectorAll('button,[role="button"]').length,
              links: body.querySelectorAll('a[href]').length,
              inputs: body.querySelectorAll('input').length,
              selects: body.querySelectorAll('select').length,
              textareas: body.querySelectorAll('textarea').length,
              forms: body.querySelectorAll('form').length,
              tables: body.querySelectorAll('table,[role="grid"],[role="table"]').length,
            },
          };
        });

        await page.addStyleTag({
          content: [
            '*,*::before,*::after { color: transparent !important; text-shadow: none !important; }',
            '* { background-image: none !important; }',
            'img,svg,canvas,video { visibility: hidden !important; }',
            'input,textarea,select,[contenteditable="true"] { color: transparent !important; }',
          ].join('\n'),
        });
        const reportDirectory = process.env.QA_REPORT_DIR;
        let screenshotPath: string | undefined;
        if (reportDirectory) {
          const safeModule = module.id.replace(/[^a-z0-9-]/gi, '-');
          const safeScreen = (screen?.route ?? 'shell').replace(/[^a-z0-9-]/gi, '-');
          const screenshotDirectory = path.join(reportDirectory, 'screenshots', appName, safeModule);
          await mkdir(screenshotDirectory, { recursive: true });
          const absoluteScreenshotPath = path.join(screenshotDirectory, `${safeScreen}.png`);
          await page.screenshot({ path: absoluteScreenshotPath, animations: 'disabled' });
          screenshotPath = path.relative(process.cwd(), absoluteScreenshotPath).split(path.sep).join('/');
          await testInfo.attach('redacted-ui-screenshot', { path: absoluteScreenshotPath, contentType: 'image/png' });
        }

        await observer.attach(testInfo, 'sanitized-api-observations.json');
        const apiSnapshot = observer.snapshot();
        const coverageStatus = screen ? 'route-rechecked' : 'blocked-screen-route-unmapped';
        const outcome = navigationSucceeded && authenticated ? 'passed' : 'failed';
        const uiScreen = {
          application: appName,
          module: module.name,
          screen: screenName,
          route: screen?.route ?? '/',
          structure,
        };
        if (!screen && 'blockedScreenReason' in module && module.blockedScreenReason) {
          testInfo.annotations.push({ type: 'coverage-blocked', description: module.blockedScreenReason });
        }

        if (reportDirectory) {
          const outputDirectory = path.join(reportDirectory, 'observations', appName, module.id);
          await mkdir(outputDirectory, { recursive: true });
          const fileName = `${(screen?.route ?? 'shell').replace(/[^a-z0-9-]/gi, '-')}.json`;
          await writeFile(path.join(outputDirectory, fileName), `${JSON.stringify({
            application: appName,
            module: module.name,
            screen: screenName,
            route: screen?.route ?? '/',
            outcome,
            coverageStatus,
            screenshotPath,
            uiScreen,
            apiObservations: apiSnapshot.observations,
            droppedObservations: apiSnapshot.droppedObservations,
          }, null, 2)}\n`, 'utf8');
        }

        expect(navigationSucceeded, 'The read-only route navigation did not complete.').toBe(true);
        expect(authenticated, 'The recheck was redirected to the login page.').toBe(true);
      });
    }
  }
}
