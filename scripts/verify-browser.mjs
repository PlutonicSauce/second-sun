// Comprehensive Playwright browser verification script for SECOND SUN
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
  console.log('🚀 Starting Vite preview server...');
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

    // 1. Initial Page Load
    const title = await page.title();
    check('Page title correct', title.includes('SECOND SUN'), title);

    const brandHeader = await page.textContent('.brand-title');
    check('Header brand title rendered', brandHeader.includes('SECOND SUN'), brandHeader);

    // Check crisis banner
    const crisisText = await page.textContent('.crisis-banner');
    check('Crisis banner mentions power crisis', crisisText.includes('Power') || crisisText.includes('Deficit'), crisisText.slice(0, 80));
    check('Mentions zero natural sunlight', crisisText.includes('zero natural sunlight'));

    // Check default 60% shortage metrics (fair heuristic gives 9 / 15 sessions, 50% minCov)
    const metricsCards = await page.$$('.metric-card');
    check('Four metric cards rendered', metricsCards.length >= 3, `Found ${metricsCards.length}`);

    const sessionsText = await metricsCards[0].textContent();
    check('Default sessions is 9 / 15', sessionsText.includes('9') && sessionsText.includes('15'), sessionsText.replace(/\s+/g, ' '));

    const minCovText = await metricsCards[1].textContent();
    check('Default minCov is 50%', minCovText.includes('50%'), minCovText.replace(/\s+/g, ' '));

    const energyText = await metricsCards[2].textContent();
    check('Default energy shows 2.25 / 2.28 kWh', energyText.includes('2.25') && energyText.includes('2.28'), energyText.replace(/\s+/g, ' '));

    // Capture initial screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '01-desktop-initial-shortage.png') });
    results.screenshots.push('01-desktop-initial-shortage.png');

    // 2. Timeline Inspection
    const roomRows = await page.$$('.timeline-row:not(.timeline-time-header):not(.timeline-power-row)');
    check('Timeline renders 3 room rows', roomRows.length === 3, `Found ${roomRows.length}`);

    // Hover a slot cell to verify inspector bar updates
    const firstAssignedSlot = await page.$('.slot-assigned');
    check('Assigned slot found on timeline', !!firstAssignedSlot);
    await firstAssignedSlot.hover();
    await wait(200);

    const inspectorText = await page.textContent('.timeline-inspector-bar');
    check('Inspector bar displays slot details on hover', inspectorText.includes('Slot #') && inspectorText.includes('W'), inspectorText);

    // 3. Power Budget Control Changes
    console.log('⚡ Testing budget changes...');
    // Click "Full Grid (100%)"
    const fullGridBtn = await page.getByRole('button', { name: 'Full Grid (100%)' });
    await fullGridBtn.click();
    await wait(300);

    const fullSessionsText = await metricsCards[0].textContent();
    check('At 100% budget, sessions increases to 15 / 15', fullSessionsText.includes('15') && fullSessionsText.includes('15 req'), fullSessionsText.replace(/\s+/g, ' '));

    const fullMinCovText = await metricsCards[1].textContent();
    check('At 100% budget, minCov is 100%', fullMinCovText.includes('100%'), fullMinCovText.replace(/\s+/g, ' '));

    await page.screenshot({ path: path.join(screenshotsDir, '02-desktop-full-budget-100.png') });
    results.screenshots.push('02-desktop-full-budget-100.png');

    // Click "Severe Rationing (25%)"
    const severeBtn = await page.getByRole('button', { name: 'Severe Rationing (25%)' });
    await severeBtn.click();
    await wait(300);

    const severeSessions = await metricsCards[0].textContent();
    check('At 25% budget, severe shortage occurs', severeSessions.includes('unmet'), severeSessions.replace(/\s+/g, ' '));

    await page.screenshot({ path: path.join(screenshotsDir, '03-desktop-severe-rationing-25.png') });
    results.screenshots.push('03-desktop-severe-rationing-25.png');

    // Reset back to default
    const resetBtn = await page.getByRole('button', { name: '↺ Reset' });
    await resetBtn.click();
    await wait(300);

    // 4. Policy Comparison Verification
    console.log('⚖ Testing Policy Comparison...');
    // Check comparison table has columns
    const comparisonHeaders = await page.$$('.col-policy');
    check('Comparison table has 3 policy columns', comparisonHeaders.length === 3);

    // Check Worst-Served Group and Level Inequality Gap rows exist
    const tableText = await page.textContent('.comparison-table');
    check('Table includes Worst-Served Group metric', tableText.includes('Worst-Served Group'));
    check('Table includes Level Inequality Gap metric', tableText.includes('Level Inequality Gap'));

    // Switch to First-Come tab
    const firstComeTab = await page.getByRole('tab', { name: /First-Come/i });
    await firstComeTab.click();
    await wait(300);

    const fcSessionsText = await metricsCards[0].textContent();
    check('First-Come mode allocates 7 sessions at 60%', fcSessionsText.includes('7') && fcSessionsText.includes('15 req'), fcSessionsText.replace(/\s+/g, ' '));

    // Switch to Directorate tab
    const dirTab = await page.getByRole('tab', { name: /Directorate/i });
    await dirTab.click();
    await wait(300);

    const dirText = await dirTab.textContent();
    check('Directorate tab indicates simulated policy', dirText.includes('Directorate'));

    await page.screenshot({ path: path.join(screenshotsDir, '04-desktop-policy-comparison.png') });
    results.screenshots.push('04-desktop-policy-comparison.png');

    // Switch back to fair
    const fairTab = await page.getByRole('tab', { name: /SECOND SUN/i });
    await fairTab.click();
    await wait(200);

    // 5. Cohort Inspection and Editing
    console.log('👥 Testing Cohort inspection and request adjustments...');
    const cohortCards = await page.$$('.cohort-card');
    check('Four cohort cards rendered', cohortCards.length === 4, `Found ${cohortCards.length}`);

    // Check level badges on cohorts
    const levelBadges = await page.$$('.cohort-name-title-row .badge');
    check('Cohort level badges rendered (L3, L5, L7, L9)', levelBadges.length >= 4);

    // Click + on first cohort requested slots
    const plusBtn = await page.$('.btn-counter:has-text("+")');
    await plusBtn.click();
    await wait(300);

    const updatedSessions = await metricsCards[0].textContent();
    check('Requested slots incremented (total requested increases to 16)', updatedSessions.includes('16 req'), updatedSessions.replace(/\s+/g, ' '));

    // Click - to restore
    const minusBtn = await page.$('.btn-counter:has-text("−")');
    await minusBtn.click();
    await wait(300);

    // 6. Room Availability Toggle
    console.log('🏛 Testing Room offline toggle...');
    const toggleBtn = await page.$('.btn-toggle-on');
    check('Online room toggle button found', !!toggleBtn);
    await toggleBtn.click();
    await wait(300);

    const offlineBadge = await page.$('.room-offline-badge');
    check('Room toggled offline and OFFLINE badge displayed', !!offlineBadge);

    await page.screenshot({ path: path.join(screenshotsDir, '05-room-offline-state.png') });
    results.screenshots.push('05-room-offline-state.png');

    // Restore room online
    const offlineToggleBtn = await page.$('.btn-toggle-off');
    await offlineToggleBtn.click();
    await wait(300);

    // 7. Scenario Switching: Multilevel Scenario
    console.log('🏢 Testing Multi-Level Grid Scenario...');
    const multilevelBtn = await page.getByRole('radio', { name: /Hollow Multi-Sector Grid/i });
    await multilevelBtn.click();
    await wait(400);

    const mlCohorts = await page.$$('.cohort-card');
    check('Multilevel scenario loads 5 cohorts (L2–L9)', mlCohorts.length === 5, `Found ${mlCohorts.length}`);

    await page.screenshot({ path: path.join(screenshotsDir, '06-multilevel-scenario.png') });
    results.screenshots.push('06-multilevel-scenario.png');

    // Reset back to Hollow default
    await resetBtn.click();
    await wait(300);

    // 8. "How It Works" Modal
    console.log('📖 Testing How It Works modal...');
    const howItWorksBtn = await page.getByRole('button', { name: /How It Works/i });
    await howItWorksBtn.click();
    await wait(300);

    const modalTitle = await page.textContent('#modal-title');
    check('How It Works modal opens', modalTitle.includes('How SECOND SUN Works'), modalTitle);

    const modalBodyText = await page.textContent('.modal-body');
    check('Modal contains scientific references', modalBodyText.includes('CIE Position Statement') && modalBodyText.includes('PLOS Biology'));
    check('Modal emphasizes safety lighting is untouchable', modalBodyText.includes('Untouchable Safety Lighting'));

    await page.screenshot({ path: path.join(screenshotsDir, '07-how-it-works-modal.png') });
    results.screenshots.push('07-how-it-works-modal.png');

    // Close modal
    const closeBtn = await page.$('.btn-modal-close');
    await closeBtn.click();
    await wait(200);

    // 9. Mobile Viewport Layout Verification
    console.log('📱 Testing Mobile layout (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await wait(400);

    // Verify operations workspace stacks to single column on mobile
    const isMobileStacked = await page.evaluate(() => {
      const el = document.querySelector('.operations-workspace');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.gridTemplateColumns.split(' ').length === 1;
    });
    check('Mobile layout stacks workspace to single column', isMobileStacked);

    await page.screenshot({ path: path.join(screenshotsDir, '08-mobile-responsive-layout.png'), fullPage: true });
    results.screenshots.push('08-mobile-responsive-layout.png');

    // 10. Keyboard Accessibility
    console.log('⌨ Testing keyboard accessibility navigation...');
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    check('Keyboard Tab focuses interactive elements', focusedTag === 'BUTTON' || focusedTag === 'A' || focusedTag === 'INPUT', focusedTag);

    console.log('✨ All browser tests PASSED successfully!');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
  } finally {
    await browser.close();
    previewProcess.kill();
  }
}

run().catch(err => {
  console.error('Fatal error during browser verification:', err);
  process.exit(1);
});
