// Comprehensive Playwright browser verification script for SECOND SUN Operator Experience
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const screenshotsDir = path.resolve(rootDir, 'screenshots');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Starting Vite preview server on port 4173...');
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: rootDir,
    stdio: 'pipe',
  });

  // Wait for preview server to be ready
  await wait(2500);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });
  const page = await context.newPage();

  const results = {
    checks: [],
    screenshots: [],
  };

  function check(name, pass, details = '') {
    results.checks.push({ name, pass, details });
    console.log(`${pass ? '✅' : '❌'} ${name} ${details ? '(' + details + ')' : ''}`);
    if (!pass) throw new Error(`Check failed: ${name} - ${details}`);
  }

  try {
    console.log('🌐 Navigating to http://localhost:4173...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    // 1. Screen 1: The Situation (Incident Overview)
    const title = await page.title();
    check('Page title correct', title.includes('SECOND SUN'), title);

    const horizonText = await page.textContent('.horizon-text');
    check('Horizon indicator rendered', horizonText.includes('CYCLE 2087-D42') && horizonText.includes('24-HOUR'), horizonText);

    const headline = await page.textContent('.incident-headline');
    check('Incident headline rendered', headline.includes('lost 40% of its available daylight power'), headline);

    const telemetryCards = await page.$$('.telemetry-card');
    check('Four telemetry cards rendered', telemetryCards.length === 4, `Found ${telemetryCards.length}`);

    const energyVal = await telemetryCards[0].textContent();
    check('Energy telemetry shows 1.92 kWh (60%)', energyVal.includes('1.92') && energyVal.includes('60%'), energyVal.replace(/\s+/g, ' '));

    const popVal = await telemetryCards[1].textContent();
    check('Population telemetry shows 152 residents', popVal.includes('152'), popVal.replace(/\s+/g, ' '));

    const unmetVal = await telemetryCards[3].textContent();
    check('Unmet requests shows 10 sessions', unmetVal.includes('10'), unmetVal.replace(/\s+/g, ' '));

    // Capture Screen 1 Overview
    await page.screenshot({ path: path.join(screenshotsDir, '01-operator-situation-overview.png') });
    results.screenshots.push('01-operator-situation-overview.png');

    // 2. Screen 2: Recommended Operations Plan (Agenda View)
    console.log('📋 Testing Screen 2: Recommended Operations Agenda...');
    const agendaCards = await page.$$('.agenda-card');
    check('Operations agenda displays 8 scheduled sessions', agendaCards.length === 8, `Found ${agendaCards.length}`);

    // Verify first card details
    const firstCardText = await agendaCards[0].textContent();
    check('First session starts at 00:00 in Sub-Station Hall', firstCardText.includes('00:00') && firstCardText.includes('Sub-Station Hall'), firstCardText.replace(/\s+/g, ' '));
    check('First session assigned to Deep Ventilation', firstCardText.includes('Deep Ventilation'), firstCardText.replace(/\s+/g, ' '));
    check('Energy shows dynamically computed kWh', firstCardText.includes('0.25 kWh') || firstCardText.includes('0.17 kWh'), firstCardText);

    // Scroll to operations plan section for agenda capture
    await page.locator('.operations-plan-section').scrollIntoViewIfNeeded();
    await wait(300);

    await page.screenshot({ path: path.join(screenshotsDir, '02-operator-recommended-plan-agenda.png') });
    results.screenshots.push('02-operator-recommended-plan-agenda.png');

    // Toggle to "By Room" View
    const byRoomBtn = await page.locator('.mode-btn', { hasText: 'By Room' });
    await byRoomBtn.click();
    await wait(300);

    const roomCards = await page.$$('.room-schedule-card');
    check('Three room schedule cards rendered', roomCards.length === 3, `Found ${roomCards.length}`);

    await page.screenshot({ path: path.join(screenshotsDir, '03-operator-plan-by-room.png') });
    results.screenshots.push('03-operator-plan-by-room.png');

    // Toggle back to Agenda View
    const agendaBtn = await page.locator('.mode-btn', { hasText: 'Agenda View' });
    await agendaBtn.click();
    await wait(200);

    // 3. Screen 3: Adjust the Situation (Real-Time Energy & Room Controls)
    console.log('⚡ Testing Screen 3: Energy & Facility Controls...');
    const p25Btn = await page.locator('.preset-btn', { hasText: '25% Crisis' });
    await p25Btn.click();
    await wait(300);

    const feedbackText25 = await page.textContent('.impact-feedback-banner');
    check('Impact banner updates for 25% crisis', feedbackText25.includes('25% available') && feedbackText25.includes('3 sessions'), feedbackText25);

    const agendaCards25 = await page.$$('.agenda-card');
    check('Agenda scaled down to 3 sessions under 25% crisis', agendaCards25.length === 3, `Found ${agendaCards25.length}`);

    // Test 100% preset
    const p100Btn = await page.locator('.preset-btn', { hasText: '100% Normal' });
    await p100Btn.click();
    await wait(300);

    const feedbackText100 = await page.textContent('.impact-feedback-banner');
    check('Impact banner updates for 100% normal grid', feedbackText100.includes('100% available'), feedbackText100);

    // Return to 60% default
    const p60Btn = await page.locator('.preset-btn', { hasText: '60% Shortage' });
    await p60Btn.click();
    await wait(300);

    // Test Room Offline Toggle (toggle Sub-Station Hall)
    const roomToggles = await page.$$('.btn-room-status');
    check('Three room online/offline buttons present', roomToggles.length === 3);
    await roomToggles[2].click(); // Toggle Sub-Station Hall offline
    await wait(300);

    const feedbackOffline = await page.textContent('.impact-feedback-banner');
    check('Impact banner reports Sub-Station Hall offline', feedbackOffline.includes('Sub-Station Hall offline'), feedbackOffline);

    await page.screenshot({ path: path.join(screenshotsDir, '04-operator-controls-adjusted.png') });
    results.screenshots.push('04-operator-controls-adjusted.png');

    // Toggle Sub-Station Hall back online
    await roomToggles[2].click();
    await wait(300);

    // 4. Screen 4: Understand the Consequences (Impact & Unmet Demand)
    console.log('🔍 Testing Screen 4: Consequences & Unmet Demand...');
    const tierBanner = await page.textContent('.tier-equity-card');
    check('Tier equity card shows Upper and Deep coverage', tierBanner.includes('Upper Sectors') && tierBanner.includes('Deep Infrastructure'), tierBanner.replace(/\s+/g, ' '));
    check('Level Inequality Gap is -17%', tierBanner.includes('-17%'), tierBanner);

    const consequenceGroups = await page.$$('.consequence-group-card');
    check('Three consequence groups rendered', consequenceGroups.length === 3);

    const partialGroupText = await consequenceGroups[0].textContent();
    check('Partially accommodated shows 5 cohorts', partialGroupText.includes('Partially Accommodated (5)'));
    check('Includes constraint explanations', partialGroupText.includes('Constraint:'));

    // Scroll to consequences section
    await page.locator('.impact-consequences-section').scrollIntoViewIfNeeded();
    await wait(300);

    await page.screenshot({ path: path.join(screenshotsDir, '05-operator-consequences-unmet-demand.png') });
    results.screenshots.push('05-operator-consequences-unmet-demand.png');

    // 5. Screen 5: Put the Plan into Action (Handover Modal)
    console.log('📤 Testing Screen 5: Handover Modal & Data Export...');
    const exportBtn = await page.locator('.btn-header-primary', { hasText: 'Export Plan' });
    await exportBtn.click();
    await wait(300);

    const handoverTitle = await page.textContent('#handover-title');
    check('Handover modal opened', handoverTitle.includes('Shift Handover Brief'), handoverTitle);

    const handoverCode = await page.textContent('.handover-code-block');
    check('Handover brief contains chronological timetable', handoverCode.includes('CHRONOLOGICAL OPERATIONS AGENDA') && handoverCode.includes('Deep Ventilation'), handoverCode.slice(0, 100));
    check('Brief contains supervisor sign-off area', handoverCode.includes('Supervisor Sign-off'));

    await page.screenshot({ path: path.join(screenshotsDir, '06-operator-handover-modal.png') });
    results.screenshots.push('06-operator-handover-modal.png');

    const closeBtn1 = await page.locator('.modal-footer .btn-secondary', { hasText: 'Close' });
    await closeBtn1.click();
    await wait(200);

    // 6. Supporting Intelligence: "Why This Schedule?" Modal
    console.log('🧠 Testing Supporting Intelligence: Why This Schedule? Modal...');
    const whyBtn = await page.locator('.btn-header-ghost', { hasText: 'Why This Schedule?' });
    await whyBtn.click();
    await wait(300);

    const whyTitle = await page.textContent('#why-schedule-title');
    check('Why This Schedule modal opened', whyTitle.includes('Why This Schedule?'), whyTitle);

    const compTable = await page.$('.comparison-table');
    check('Side-by-side policy comparison table present in modal', !!compTable);

    await page.screenshot({ path: path.join(screenshotsDir, '07-operator-why-schedule-modal.png') });
    results.screenshots.push('07-operator-why-schedule-modal.png');

    const closeBtn2 = await page.locator('.modal-footer .btn-secondary', { hasText: 'Close' });
    await closeBtn2.click();
    await wait(200);

    // 7. Full-Page Desktop Capture
    await page.screenshot({
      path: path.join(screenshotsDir, '00-operator-desktop-fullpage.png'),
      fullPage: true,
    });
    results.screenshots.push('00-operator-desktop-fullpage.png');

    // 8. Mobile Responsiveness (390px Viewport)
    console.log('📱 Testing Mobile Responsiveness (390px iPhone Viewport)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await wait(400);

    const mobileHeadline = await page.textContent('.incident-headline');
    check('Mobile headline renders cleanly', mobileHeadline.includes('lost 40%'));

    const mobileAgendaCards = await page.$$('.agenda-card');
    check('Mobile agenda cards present', mobileAgendaCards.length === 8);

    await page.screenshot({
      path: path.join(screenshotsDir, '08-operator-mobile-390px.png'),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(screenshotsDir, '08-operator-mobile-390px-full.png'),
      fullPage: true,
    });
    results.screenshots.push('08-operator-mobile-390px.png', '08-operator-mobile-390px-full.png');

    console.log('\n🎉 ALL OPERATOR E2E BROWSER CHECKS PASSED SUCCESSFULLY!');
    console.log(`📸 Saved ${results.screenshots.length} screenshots to ${screenshotsDir}`);
  } finally {
    await browser.close();
    previewProcess.kill();
  }
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
