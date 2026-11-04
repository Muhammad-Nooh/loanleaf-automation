import { test, expect } from '@playwright/test';
import { ciihive } from '../../src/core/env';
import { NetworkObserver } from '../../src/core/network-observer';

// Runs with the saved CiiHive session (see tests/setup/ciihive.setup.ts).
test('CiiHive: logged-in session reaches the app', async ({ page }, testInfo) => {
  const observer = new NetworkObserver(page, { application: 'ciihive', module: 'Application Shell' });
  observer.start();
  await observer.withAction('open application shell', () =>
    page.goto(new URL('/', ciihive.url).toString()));
  await expect(page).not.toHaveURL(/#\/login/);
  await observer.attach(testInfo, 'ciihive-api-observations.json');
});
