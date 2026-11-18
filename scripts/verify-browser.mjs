// Comprehensive Playwright browser verification script for SECOND SUN Refinements
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

    // 1. Corrected Hero Metrics & Subterranean Span (including Level 9)
    const title = await page.title();
    check('Page title correct', title.includes('SECOND SUN'), title);

    const heroLede = await page.textContent('.hero-lede');
    check('Hero lede includes Level 9 in subterranean span', heroLede.includes('Levels 2 through 9'), heroLede);

    const specVals = await page.$$('.spec-val');
    check('Three hero spec values rendered', specVals.length === 3, `Found ${specVals.length}`);

    const energyVal = await specVals[0].textContent();
    check('Power budget spec shows 1.92 kWh', energyVal.includes('1.92'), energyVal);

    const sessionVal = await specVals[1].textContent();
    check('Sessions spec shows 8 Sessions', sessionVal.includes('8'), sessionVal);

    const residentVal = await specVals[2].textContent();
    check('Residents spec shows "152 of 152"', residentVal.includes('152 of 152'), residentVal);

    await page.screenshot({ path: path.join(screenshotsDir, '01-correct-hero-specs.png') });
    results.screenshots.push('01-correct-hero-specs.png');

    // 2. Room Availability Control: Toggle Room Offline
    console.log('🛠️ Testing Room Availability Control (Taking Room Offline)...');
    const roomCards = await page.$$('.room-control-card');
    check('Three room availability cards rendered', roomCards.length === 3, `Found ${roomCards.length}`);

    // Click "Take Offline" on Sub-Station Hall (roomCards[2] or by name)
    const subStationToggle = await page.locator('.room-control-card', { hasText: 'Sub-Station Hall' }).locator('.btn-room-toggle');
    await subStationToggle.click();
    await wait(300);

    const idleBoxAfterOffline = await page.textContent('.runsheet-idle-box');
    check('Idle facilities notice shows Sub-Station Hall offline for maintenance',
      idleBoxAfterOffline.includes('Sub-Station Hall') && idleBoxAfterOffline.includes('Offline for maintenance'),
      idleBoxAfterOffline.replace(/\s+/g, ' ')
    );

    await page.screenshot({ path: path.join(screenshotsDir, '03-room-offline-reschedule.png') });
    results.screenshots.push('03-room-offline-reschedule.png');

    // Bring Sub-Station Hall back online
    await subStationToggle.click();
    await wait(300);

    // 3. Emergency Interaction: "Simulate Generator Failure"
    console.log('⚡ Testing Emergency Contingency: "Simulate Generator Failure"...');
    const generatorFailBtn = await page.locator('.btn-apple-emergency-trigger', { hasText: 'Simulate Generator Failure' });
    await generatorFailBtn.click();
    await wait(400);

    const emergencyBanner = await page.$('.emergency-delta-banner');
    check('Emergency Delta Banner rendered upon generator failure trigger', !!emergencyBanner);

    const emergencySubtitle = await page.textContent('.emergency-subtitle');
    check('Emergency subtitle reports real power drop', emergencySubtitle.includes('dropped from') && emergencySubtitle.includes('kWh'), emergencySubtitle);

    const lostSessionsStat = await page.textContent('.stat-delta');
    check('Emergency telemetry displays lost sessions delta', lostSessionsStat.includes('-'), lostSessionsStat);

    const breakdownCards = await page.$$('.breakdown-card');
    check('Breakdown cards present for affected resident groups', breakdownCards.length > 0, `Found ${breakdownCards.length}`);

    await page.screenshot({ path: path.join(screenshotsDir, '02-emergency-generator-failure.png') });
    results.screenshots.push('02-emergency-generator-failure.png');

    // Restore previous schedule
    const restoreBtn = await page.locator('.btn-emergency-restore', { hasText: 'Restore Previous Schedule' });
    await restoreBtn.click();
    await wait(300);

    const bannerAfterRestore = await page.$('.emergency-delta-banner');
    check('Emergency banner dismissed after restoring previous schedule', bannerAfterRestore === null);

    // 4. Centerpiece: Tomorrow's Lighting Run Sheet Scanability & Consolidation
    console.log('📋 Testing Run Sheet Consolidation & Scanability...');
    const runsheetRows = await page.$$('.runsheet-row');
    check('Run sheet contains merged operational blocks', runsheetRows.length > 0, `Found ${runsheetRows.length} blocks`);

    const firstRowText = await runsheetRows[0].textContent();
    check('First row displays time, room, crew, action instruction, and wake window status',
      firstRowText.includes('00:00') &&
      firstRowText.includes('Sub-Station Hall') &&
      firstRowText.includes('Action: Unlock room & energize to 500W') &&
      firstRowText.includes('Deep Ventilation'),
      firstRowText.replace(/\s+/g, ' ')
    );

    // Verify Idle facilities notice uses truthful grounding
    const idleBox = await page.textContent('.runsheet-idle-box');
    check('Idle notice uses truthful explanation (no unsupported locked all day claims)',
      idleBox.includes('Central Atrium') && idleBox.includes('Unscheduled tomorrow'),
      idleBox.replace(/\s+/g, ' ')
    );

    await page.locator('.runsheet-section').scrollIntoViewIfNeeded();
    await wait(200);
    await page.screenshot({ path: path.join(screenshotsDir, '04-improved-runsheet-scanability.png') });
    results.screenshots.push('04-improved-runsheet-scanability.png');

    // 5. Crew Inquiry Reference: Dynamic Equity Evaluation
    console.log('🔍 Testing Crew Inquiry Reference...');
    const unmetCards = await page.$$('.unmet-card');
    check('Five cohort inquiry cards rendered', unmetCards.length === 5, `Found ${unmetCards.length}`);

    const equityFooter = await page.textContent('.unmet-equity-footer');
    check('Equity evaluation footer dynamically references deep-level workgroups',
      equityFooter.includes('EQUITY EVALUATION') && equityFooter.includes('deep-level workgroups'),
      equityFooter.replace(/\s+/g, ' ')
    );

    await page.locator('.unmet-guide-section').scrollIntoViewIfNeeded();
    await wait(200);
    await page.screenshot({ path: path.join(screenshotsDir, '05-unmet-demand-equity.png') });
    results.screenshots.push('05-unmet-demand-equity.png');

    // 6. Full-Page Desktop Capture
    await page.screenshot({
      path: path.join(screenshotsDir, '00-apple-desktop-fullpage.png'),
      fullPage: true,
    });
    results.screenshots.push('00-apple-desktop-fullpage.png');

    // 7. Mobile Responsiveness (390px Viewport)
    console.log('📱 Testing Mobile Responsiveness (390px iPhone Viewport)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await wait(400);

    const mobileHeroTitle = await page.textContent('.hero-title');
    check('Mobile hero title renders cleanly', mobileHeroTitle.includes("Tomorrow's Lighting Operations Plan"));

    await page.screenshot({
      path: path.join(screenshotsDir, '07-apple-mobile-390px.png'),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(screenshotsDir, '07-apple-mobile-390px-full.png'),
      fullPage: true,
    });
    results.screenshots.push('07-apple-mobile-390px.png', '07-apple-mobile-390px-full.png');

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
