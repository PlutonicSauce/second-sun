import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const screenshots = process.env.SECOND_SUN_SCREENSHOTS ?? await mkdtemp(path.join(tmpdir(), 'second-sun-browser-'));
await mkdir(screenshots, { recursive: true });

const server = await preview({ root, preview: { host: '127.0.0.1', port: 0 } });
let browser;
try {
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const url = `http://127.0.0.1:${server.httpServer.address().port}`;
  await page.goto(url);
  const save = (name, fullPage = false) => page.screenshot({ path: path.join(screenshots, name + '.png'), fullPage });
  const byButton = name => page.getByRole('button', { name, exact: true });
  const allocation = page.getByRole('group', { name: 'Allocation policy' });
  const policy = name => allocation.getByRole('button', { name: new RegExp('^' + name) });
  const subtitle = page.locator('.emergency-subtitle').first();
  const hall = page.locator('.room-control-card', { hasText: 'Sub-Station Hall' });
  const runSheet = page.locator('#run-sheet');
  const rows = runSheet.getByRole('listitem').filter({ has: page.locator('.time-primary') });
  let checks = 0;
  async function check(name, test) {
    await test();
    console.log(`PASS ${++checks} · ${name}`);
  }

  async function download(button) {
    const pending = page.waitForEvent('download');
    await button.click();
    const file = await pending;
    assert.equal(await file.failure(), null);
    return readFile(await file.path(), 'utf8');
  }

  await check('Opening shortage distinguishes residents from fulfilled requests', async () => {
    assert.match(await page.title(), /SECOND SUN/);
    assert.match(await page.locator('.hero-lede').innerText(), /without sunlight.*Levels 2 through 9/);
    assert.deepEqual(await page.locator('.spec-val').allTextContents(), ['60%', '8 of 18', '152 of 152']);
    assert.match(await page.locator('.hero-specs-strip').innerText(), /10 unmet[^]*at least one session/);
    assert.equal(await page.locator('.tier-row').count(), 5);
    await save('desktop-full', true);
    await save('desktop-opening');
  });

  await check('Directorate and first-come switch the active run sheet', async () => {
    await policy('Directorate').click();
    assert.equal(await policy('Directorate').getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('.selected-policy-note').innerText(), /Fictional policy/);
    assert.match(await page.locator('.tier-row').filter({ hasText: 'Level 9' }).innerText(), /0 of 4 booked[^]*No room time/);
    assert.match(await runSheet.innerText(), /Directorate · 00:00–24:00/);
    await page.locator('#allocation').scrollIntoViewIfNeeded();
    await save('directorate');
    await policy('First-come').click();
    assert.match(await runSheet.innerText(), /First-come · 00:00–24:00/);
    await policy('SECOND SUN').click();
    await page.getByRole('link', { name: /View run sheet/ }).click();
    assert.match(page.url(), /#run-sheet$/);
    const first = await rows.first().innerText();
    assert.match(first, /00:00 – 01:00[^]*Sub-Station Hall[^]*500 W[^]*Deep Ventilation/);
  });

  await check('Room switches recalculate bookings and show truthful room status', async () => {
    await hall.getByRole('button', { name: 'Take Offline' }).click();
    assert.match(await runSheet.locator('.runsheet-idle-box').innerText(), /Sub-Station Hall[^]*Offline in this scenario/);
    assert.equal(await rows.filter({ hasText: 'Sub-Station Hall' }).count(), 0);
    await save('room-offline');
    await hall.getByRole('button', { name: 'Bring Online' }).click();
    assert.ok(await rows.filter({ hasText: 'Sub-Station Hall' }).count());
  });

  await check('Generator simulation is capped and reacts to policy, budget and room edits', async () => {
    await byButton('Simulate generator failure').click();
    assert.match(await subtitle.innerText(), /1\.92 → 0\.80 kWh/);
    assert.match(await page.locator('.emergency-stats-strip').innerText(), /8 → 3/);
    await byButton('100%').click();
    assert.match(await subtitle.innerText(), /3\.20 → 0\.80 kWh/);
    const originalDelta = await page.locator('.emergency-stats-strip').innerText();
    await policy('Directorate').click();
    assert.notEqual(await page.locator('.emergency-stats-strip').innerText(), originalDelta);
    await hall.getByRole('button', { name: 'Take Offline' }).click();
    assert.equal(await rows.filter({ hasText: 'Sub-Station Hall' }).count(), 0);
    await byButton('Restore baseline budget').click();
    assert.equal(await subtitle.count(), 0);
    assert.match(await page.locator('.spec-val').first().innerText(), /100%/);
    assert.match(await runSheet.innerText(), /Directorate · 00:00–24:00/);
    assert.equal(await hall.getByRole('button', { name: 'Bring Online' }).count(), 1);
    await byButton('Reset').click();
  });

  await check('Keyboard slider, lower starting power and hiding emergency details', async () => {
    const slider = page.getByRole('slider');
    await slider.press('Home');
    assert.equal(await slider.inputValue(), '0');
    assert.match(await runSheet.innerText(), /No Operational Hours Scheduled/);
    await byButton('Simulate generator failure').click();
    assert.match(await subtitle.innerText(), /0\.00 → 0\.00 kWh/);
    await byButton('Hide changes').click();
    assert.equal(await subtitle.count(), 0);
    assert.match(await page.getByRole('status').innerText(), /failure active · 0% available/);
    await byButton('Show changes').click();
    assert.match(await subtitle.innerText(), /0\.00 → 0\.00 kWh/);
    await byButton('End failure simulation').click();
    assert.equal(await slider.inputValue(), '0');
    await byButton('60%').click();
    await byButton('Simulate generator failure').click();
    await page.locator('.emergency-delta-banner').scrollIntoViewIfNeeded();
    await save('generator-failure');
    await byButton('End failure simulation').click();
  });

  await check('Comparison and methodology dialogs open, trap focus and close with Escape', async () => {
    await byButton('Compare policies').click();
    const comparison = page.getByRole('dialog', { name: 'Compare policy results' });
    assert.equal(await comparison.getByRole('group').getByRole('button').count(), 3);
    await save('policy-comparison');
    await comparison.getByRole('button', { name: /^Directorate/ }).click();
    assert.equal(await comparison.getByRole('button', { name: /^Directorate/ }).getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('Tab');
    assert.equal(await comparison.evaluate(dialog => dialog.contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    assert.equal(await comparison.count(), 0);
    assert.equal(await byButton('Compare policies').evaluate(button => document.activeElement === button), true);
    await byButton('How it works').click();
    assert.match(await page.getByRole('dialog').innerText(), /whole|heuristic/i);
    await page.keyboard.press('Escape');
  });

  await check('CSV, JSON and clipboard handover match the active Directorate run sheet', async () => {
    const csv = await download(runSheet.getByRole('button', { name: 'Download CSV' }));
    await byButton('Export Plan').click();
    const dialog = page.getByRole('dialog', { name: 'Export the active plan' });
    assert.equal(await download(dialog.getByRole('button', { name: 'Download CSV' })), csv);
    const json = JSON.parse(await download(dialog.getByRole('button', { name: 'Download JSON' })));
    const schedule = json.activeSchedule;
    assert.equal(schedule.policy, 'directorate');
    assert.equal(schedule.metrics.sessions, schedule.assignments.length);
    const csvRows = csv.trim().split('\n').slice(1);
    assert.equal(csvRows.length, schedule.assignments.length);
    for (const [index, assignment] of schedule.assignments.entries()) {
      assert.ok(csvRows[index].includes(`"directorate",${assignment.slotIndex},"${assignment.startTime}","${assignment.endTime}","${assignment.roomId}"`));
    }
    const printedRows = await rows.allTextContents();
    assert.equal(printedRows.length, schedule.bookings.length);
    for (const [index, booking] of schedule.bookings.entries()) {
      assert.ok(printedRows[index].includes(booking.roomName));
      assert.ok(printedRows[index].includes(booking.cohortName));
      assert.ok(printedRows[index].includes(booking.preferredSummary));
    }
    await dialog.getByRole('button', { name: 'Copy handover brief' }).click();
    await dialog.getByText('Brief copied.').waitFor();
    const handover = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(handover, await dialog.locator('pre').textContent());
    assert.match(handover, /Policy: Directorate\. Fictional[^]*Sessions: 6 of 18[^]*Residents with at least one session: 42 of 152/);
    assert.match(handover, /Peak load: \d+ of 1100 W/);
    await save('handover');
    await page.keyboard.press('Escape');
  });

  await check('Print action invokes browser print and print layout contains only the active schedule', async () => {
    await page.evaluate(() => {
      window.print = () => document.body.setAttribute('data-print-invoked', 'yes');
    });
    await byButton('Print Run Sheet').click();
    assert.equal(await page.locator('body').getAttribute('data-print-invoked'), 'yes');
    await page.setViewportSize({ width: 816, height: 1056 });
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('#allocation').isVisible(), false);
    assert.equal(await page.locator('.operator-header').isVisible(), false);
    assert.match(await runSheet.innerText(), /Directorate · 00:00–24:00/);
    await save('print-run-sheet');
    const printOutput = await page.pdf({ format: 'Letter' });
    assert.equal(printOutput.subarray(0, 5).toString(), '%PDF-');
    await page.emulateMedia({ media: 'screen' });
    await page.setViewportSize({ width: 1440, height: 960 });
  });

  await check('390px layout fits; mobile policy, run sheet and export remain usable', async () => {
    await byButton('Reset').click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await save('mobile-full', true);
    await save('mobile-opening');
    await policy('Directorate').click();
    await page.getByRole('link', { name: /View run sheet/ }).click();
    assert.match(await runSheet.innerText(), /Directorate/);
    await byButton('Handover & JSON').click();
    const dialog = page.getByRole('dialog', { name: 'Export the active plan' });
    const box = await dialog.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 390);
    assert.ok(box.y >= 0 && box.y + box.height <= 844);
    assert.ok(Math.abs(box.x + box.width / 2 - 195) < 2);
    await save('mobile-handover');
    await dialog.getByRole('button', { name: 'Close dialog' }).click();
    assert.deepEqual(pageErrors, []);
  });

  console.log(`${checks} browser checks passed. Screenshots: ${screenshots}`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
