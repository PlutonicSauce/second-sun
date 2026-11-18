// Comprehensive Playwright browser verification script for Apple-inspired SECOND SUN
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

    // 1. Apple Header & Hero
    const title = await page.title();
    check('Page title correct', title.includes('SECOND SUN'), title);

    const heroTitle = await page.textContent('.hero-title');
    check('Hero title rendered', heroTitle.includes("Tomorrow's Lighting Operations Plan"), heroTitle);

    const specVals = await page.$$('.spec-val');
    check('Three hero spec values rendered', specVals.length === 3, `Found ${specVals.length}`);

    const energyVal = await specVals[0].textContent();
    check('Power budget spec shows 1.92 kWh', energyVal.includes('1.92'), energyVal);

    const residentVal = await specVals[2].textContent();
    check('Residents spec shows 152 Residents', residentVal.includes('152'), residentVal);

    await page.screenshot({ path: path.join(screenshotsDir, '01-apple-hero-specs.png') });
    results.screenshots.push('01-apple-hero-specs.png');

    // 2. Centerpiece: Tomorrow's Lighting Run Sheet
    console.log('📋 Testing Centerpiece: Tomorrow\'s Lighting Run Sheet...');
    const runsheetRows = await page.$$('.runsheet-row');
    check('Run sheet contains merged operational blocks', runsheetRows.length > 0, `Found ${runsheetRows.length} blocks`);

    const firstRowText = await runsheetRows[0].textContent();
    check('First row displays time, room, crew, and energy',
      firstRowText.includes('00:00') &&
      firstRowText.includes('Sub-Station Hall') &&
      firstRowText.includes('Deep Ventilation') &&
      firstRowText.includes('500W'),
      firstRowText.replace(/\s+/g, ' ')
    );

    // Verify Idle facilities box
    const idleBox = await page.textContent('.runsheet-idle-box');
    check('Idle facilities notice lists Central Atrium', idleBox.includes('Central Atrium') && idleBox.includes('Locked all day'), idleBox.replace(/\s+/g, ' '));

    await page.screenshot({ path: path.join(screenshotsDir, '02-apple-runsheet.png') });
    results.screenshots.push('02-apple-runsheet.png');

    // 3. Power Slider & Presets
    console.log('⚡ Testing Power Slider Controls...');
    const preset25Btn = await page.locator('.btn-apple-preset', { hasText: '25% Emergency' });
    await preset25Btn.click();
    await wait(300);

    const consequence25 = await page.textContent('.power-consequence-text');
    check('Consequence text updates for 25% emergency', consequence25.includes('75% deficit'), consequence25);

    const rows25 = await page.$$('.runsheet-row');
    check('Runsheet dynamically scales to emergency schedule', rows25.length < runsheetRows.length, `Count: ${rows25.length}`);

    await page.screenshot({ path: path.join(screenshotsDir, '03-apple-power-control-25pct.png') });
    results.screenshots.push('03-apple-power-control-25pct.png');

    // Return to 60% Shortage
    const preset60Btn = await page.locator('.btn-apple-preset', { hasText: '60% Shortage' });
    await preset60Btn.click();
    await wait(300);

    // 4. Crew Inquiry Reference
    console.log('🔍 Testing Crew Inquiry Reference (Unmet Demand Guide)...');
    const unmetCards = await page.$$('.unmet-card');
    check('Five cohort inquiry cards rendered', unmetCards.length === 5, `Found ${unmetCards.length}`);

    const card1Text = await unmetCards[0].textContent();
    check('Directorate Staff inquiry card has percentage and constraint explanation',
      card1Text.includes('Directorate Staff') && card1Text.includes('33%'),
      card1Text.replace(/\s+/g, ' ')
    );

    const equityFooter = await page.textContent('.unmet-equity-footer');
    check('Equity assurance footer rendered', equityFooter.includes('EQUITY ASSURANCE') && equityFooter.includes('no deep-level sector is completely blacked out'), equityFooter.replace(/\s+/g, ' '));

    await page.screenshot({ path: path.join(screenshotsDir, '04-apple-unmet-demand-guide.png') });
    results.screenshots.push('04-apple-unmet-demand-guide.png');

    // 5. Handover Modal
    console.log('📤 Testing Handover Export Modal...');
    const exportBtn = await page.locator('.btn-header-primary', { hasText: 'Export Plan' });
    await exportBtn.click();
    await wait(300);

    const handoverCode = await page.textContent('.handover-code-block');
    check('Handover brief contains printable shift brief', handoverCode.includes('SECOND SUN') && handoverCode.includes('DISCRETIONARY LIGHTING OPERATIONS'), handoverCode.slice(0, 100));

    await page.screenshot({ path: path.join(screenshotsDir, '05-apple-handover-modal.png') });
    results.screenshots.push('05-apple-handover-modal.png');

    const closeBtn1 = await page.locator('.btn-modal-close');
    await closeBtn1.click();
    await wait(200);

    // 6. Why This Schedule Modal
    console.log('🧠 Testing Why This Schedule Modal...');
    const whyBtn = await page.locator('.btn-header-ghost', { hasText: 'Why This Schedule?' });
    await whyBtn.click();
    await wait(300);

    const whyTitle = await page.textContent('.modal-title');
    check('Why This Schedule modal opened', whyTitle.includes('Why This Schedule?'), whyTitle);

    await page.screenshot({ path: path.join(screenshotsDir, '06-apple-why-schedule-modal.png') });
    results.screenshots.push('06-apple-why-schedule-modal.png');

    const closeBtn2 = await page.locator('.btn-modal-close');
    await closeBtn2.click();
    await wait(200);

    // 7. Full-Page Desktop Capture
    await page.screenshot({
      path: path.join(screenshotsDir, '00-apple-desktop-fullpage.png'),
      fullPage: true,
    });
    results.screenshots.push('00-apple-desktop-fullpage.png');

    // 8. Mobile Responsiveness (390px Viewport)
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
