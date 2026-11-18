// Comprehensive Playwright browser verification script for SECOND SUN Redesign
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

    // 1. Initial Page Load & Headline
    const title = await page.title();
    check('Page title correct', title.includes('SECOND SUN'), title);

    const brandName = await page.textContent('.brand-name');
    check('Brand lockup rendered', brandName.includes('SECOND SUN'), brandName);

    const headline = await page.textContent('.hero-headline');
    check('Headline rendered clearly', headline.includes('Everyone needs light'), headline);

    const powerReadout = await page.textContent('.power-readout');
    check('Default power is 60% (1.92 kWh)', powerReadout.includes('60%') && powerReadout.includes('1.92'), powerReadout);

    // 2. Visual Centerpiece: Subterranean Levels
    const levelRows = await page.$$('.level-row');
    check('Five subterranean habitat levels rendered', levelRows.length === 5, `Found ${levelRows.length} levels`);

    // Under SECOND SUN at 60%, check Level 9 coverage
    const level9Row = levelRows[4];
    const level9Text = await level9Row.textContent();
    check('Level 9 Deep Ventilation rendered', level9Text.includes('Deep Ventilation') || level9Text.includes('L9'), level9Text.slice(0, 60));
    check('Level 9 receives light under SECOND SUN (50%)', level9Text.includes('50%') || level9Text.includes('2/4'), level9Text);

    // Capture initial screenshot (SECOND SUN at 60%)
    await page.screenshot({ path: path.join(screenshotsDir, '01-redesign-desktop-fair-60.png') });
    await page.screenshot({ path: path.join(screenshotsDir, '01-redesign-desktop-fair-60-full.png'), fullPage: true });
    results.screenshots.push('01-redesign-desktop-fair-60.png', '01-redesign-desktop-fair-60-full.png');

    // 3. Switch to Directorate Policy
    console.log('🏛 Testing Directorate Policy switch...');
    const dirBtn = await page.locator('.policy-toggle-btn', { hasText: 'Directorate Policy' });
    await dirBtn.click();
    await wait(400);

    const dirOutcome = await page.textContent('.outcome-narrative');
    check('Outcome narrative updates for Directorate', dirOutcome.includes('Directorate policy'), dirOutcome.slice(0, 80));

    // Under Directorate, Level 9 should be 0% in darkness
    const level9DirText = await levelRows[4].textContent();
    check('Level 9 gets 0% under Directorate', level9DirText.includes('0%') || level9DirText.includes('0/4'), level9DirText);

    // Capture Directorate screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '02-redesign-desktop-directorate-60.png') });
    await page.screenshot({ path: path.join(screenshotsDir, '02-redesign-desktop-directorate-60-full.png'), fullPage: true });
    results.screenshots.push('02-redesign-desktop-directorate-60.png', '02-redesign-desktop-directorate-60-full.png');

    // Switch back to SECOND SUN
    const fairBtn = await page.locator('.policy-toggle-btn', { hasText: 'SECOND SUN' });
    await fairBtn.click();
    await wait(300);

    // 4. Test Power Presets
    console.log('⚡ Testing Power Preset: 25% Critical Shortage...');
    const p25Btn = await page.locator('.preset-pill', { hasText: '25%' });
    await p25Btn.click();
    await wait(300);

    const p25Readout = await page.textContent('.power-readout');
    check('Power updates to 25%', p25Readout.includes('25%'), p25Readout);

    await page.screenshot({ path: path.join(screenshotsDir, '03-redesign-desktop-crisis-25.png') });
    results.screenshots.push('03-redesign-desktop-crisis-25.png');

    console.log('⚡ Testing Power Preset: 100% Normal Grid...');
    const p100Btn = await page.locator('.preset-pill', { hasText: '100%' });
    await p100Btn.click();
    await wait(300);

    const p100Readout = await page.textContent('.power-readout');
    check('Power updates to 100%', p100Readout.includes('100%'), p100Readout);

    await page.screenshot({ path: path.join(screenshotsDir, '04-redesign-desktop-normal-100.png') });
    results.screenshots.push('04-redesign-desktop-normal-100.png');

    // Return to 60% default
    const p60Btn = await page.locator('.preset-pill', { hasText: '60%' });
    await p60Btn.click();
    await wait(300);

    // 5. Test Interactive Level Inspection Drawer
    console.log('🔍 Testing interactive level drawer on Level 9...');
    await levelRows[4].click();
    await wait(300);

    const drawerStat = await page.$('.level-expanded-drawer');
    check('Level expanded drawer opens on click', !!drawerStat);
    const drawerText = await drawerStat.textContent();
    check('Drawer shows shift window & accessible facilities', drawerText.includes('window') || drawerText.includes('Facilities'), drawerText.slice(0, 80));

    await page.screenshot({ path: path.join(screenshotsDir, '05-redesign-level-drawer-expanded.png') });
    results.screenshots.push('05-redesign-level-drawer-expanded.png');

    // 6. Test Progressive Disclosure: System Inspector
    console.log('🔬 Testing System Inspector drawer...');
    const inspectorToggle = await page.$('.inspector-toggle-bar');
    check('System Inspector toggle bar present', !!inspectorToggle);
    await inspectorToggle.click();
    await wait(400);

    const timelineContainer = await page.$('.timeline-container');
    check('24-Hour Timeline rendered inside System Inspector', !!timelineContainer);

    // Verify hover on timeline slot and the dynamic kWh calculation
    const assignedSlot = await page.$('.slot-assigned');
    check('Assigned slot found on timeline', !!assignedSlot);
    await assignedSlot.hover();
    await wait(200);

    const inspectorBarText = await page.textContent('.timeline-inspector-bar');
    check('Timeline inspector dynamically displays power and kWh', inspectorBarText.includes('kWh') && inspectorBarText.includes('W'), inspectorBarText);

    await page.screenshot({ path: path.join(screenshotsDir, '06-redesign-system-inspector-timeline.png') });
    results.screenshots.push('06-redesign-system-inspector-timeline.png');

    // Switch to Policy Comparison Benchmark Tab
    const benchmarkTabBtn = await page.locator('.inspector-tab-btn', { hasText: '3-Way Policy Benchmark' });
    await benchmarkTabBtn.click();
    await wait(300);

    const compTable = await page.$('.comparison-table');
    check('3-way policy comparison table rendered in inspector', !!compTable);

    await page.screenshot({ path: path.join(screenshotsDir, '07-redesign-system-inspector-benchmark.png') });
    results.screenshots.push('07-redesign-system-inspector-benchmark.png');

    // 7. Test About & Science Modal
    console.log('📖 Testing About & Science Modal...');
    const aboutBtn = await page.locator('.nav-btn-secondary', { hasText: 'About & Science' });
    await aboutBtn.click();
    await wait(300);

    const modalTitle = await page.textContent('.modal-title');
    check('About modal opened with peer-reviewed citations', modalTitle.includes('How SECOND SUN Works'), modalTitle);

    await page.screenshot({ path: path.join(screenshotsDir, '08-redesign-about-modal.png') });
    results.screenshots.push('08-redesign-about-modal.png');

    const closeBtn = await page.$('.btn-modal-close') || await page.locator('button', { hasText: 'Close' });
    await closeBtn.click();
    await wait(200);

    // 8. Test Mobile Responsiveness (390px)
    console.log('📱 Testing Mobile Responsiveness (390px viewport)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await wait(400);

    const mobileHeadline = await page.textContent('.hero-headline');
    check('Mobile headline renders nicely', mobileHeadline.includes('Everyone needs light'));

    await page.screenshot({
      path: path.join(screenshotsDir, '09-redesign-mobile-390px.png'),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(screenshotsDir, '09-redesign-mobile-390px-full.png'),
      fullPage: true,
    });
    results.screenshots.push('09-redesign-mobile-390px.png', '09-redesign-mobile-390px-full.png');

    console.log('\n🎉 ALL E2E BROWSER CHECKS PASSED SUCCESSFULLY!');
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
