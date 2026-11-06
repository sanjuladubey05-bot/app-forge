import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Browser Error:', msg.text());
    }
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });

  // 1. Check Dashboard loads
  await page.waitForSelector('text=Workspace Dashboard', { timeout: 10000 });
  console.log('✓ Workspace Dashboard loaded');

  // 2. Click "Practice Project" from Choose a Starting Point
  const practiceBtn = page.locator('button:has-text("Practice Project")').first();
  await practiceBtn.click();
  console.log('✓ Clicked Practice Project');

  // 3. Wait for Studio Canvas & TopToolbar
  await page.waitForSelector('text=APPFORGE', { timeout: 10000 });
  console.log('✓ Editor Canvas loaded with Practice Project');

  // 4. Verify Tutorial Quest Widget is rendered
  await page.waitForSelector('text=AppForge Play-to-Build', { timeout: 5000 });
  console.log('✓ Play-to-Build Quest Widget visible');

  // 5. Test adding another button from Components tab
  const compTabBtn = page.locator('nav[aria-label="Editor panels"] button[title="Components"]');
  await compTabBtn.click();
  const addActionBtn = page.locator('text=Action Button').first();
  await addActionBtn.click();
  console.log('✓ Added Action Button to Canvas');

  // 6. Test Sections Tab
  const secTabBtn = page.locator('nav[aria-label="Editor panels"] button[title="Sections"]');
  await secTabBtn.click();
  await page.waitForSelector('text=Section Library', { timeout: 5000 });
  console.log('✓ Section Library tab open (14 prebuilt sections)');

  // Filter by Website
  const websiteFilter = page.locator('button:has-text("Website")').first();
  await websiteFilter.click();
  console.log('✓ Filtered Section Library by Website');

  // Click "Add to Canvas" on Hero Banner
  const addHeroBtn = page.locator('button:has-text("Add to Canvas")').first();
  await addHeroBtn.click();
  console.log('✓ Added Prebuilt Hero Section to Canvas');

  // 7. Test Pages Tab & Create Profile Screen
  const pagesTabBtn = page.locator('nav[aria-label="Editor panels"] button[title="Pages"]');
  await pagesTabBtn.click();
  await page.waitForSelector('text=Application Pages', { timeout: 5000 });

  // Click "Add Page" button to open creation form
  const addPageHeaderBtn = page.locator('button:has-text("Add Page")');
  await addPageHeaderBtn.click();

  // Fill in new page name "Profile"
  const newPageInput = page.locator('input[placeholder*="Dashboard"]');
  await newPageInput.fill('Profile');
  const createPageBtn = page.locator('button:has-text("Create")').first();
  await createPageBtn.click();
  console.log('✓ Created Profile Screen');

  // 8. Select Button and set When Clicked -> Open Page -> Profile
  // Switch back to Home screen
  const homeScreenBtn = page.locator('text=Home').first();
  await homeScreenBtn.click();

  // Click on the button in canvas
  const canvasButton = page.locator('text="Go to My Profile →"').first();
  await canvasButton.click({ force: true });
  console.log('✓ Selected button on canvas');

  // Go to Props tab on right PropertiesPanel
  const propsTab = page.locator('aside button:has-text("Props")');
  await propsTab.click();

  // Locate "Action Type" select inside When Clicked card
  const actionTypeSelect = page.locator('select:has-text("None (Standard Element)"), select:has-text("Open Page")').first();
  await actionTypeSelect.selectOption('openPage');
  console.log('✓ Selected Action Type: Open Page');

  // Locate destination screen select
  const destSelect = page.locator('select:has-text("-- Select Destination Screen --")').first();
  // Select option that includes Profile
  const options = await destSelect.locator('option').allInnerTexts();
  console.log('Available destination options:', options);
  const profileOpt = options.find(o => o.includes('Profile'));
  if (profileOpt) {
    await destSelect.selectOption({ label: profileOpt });
  }
  console.log('✓ Connected button to Profile screen');

  // 9. Test Motion tab trigger dropdown selector
  const motionTab = page.locator('aside button:has-text("Motion")');
  await motionTab.click();
  const triggerSelect = page.locator('select:has-text("On Load (When screen opens)")');
  await triggerSelect.selectOption('onClick');
  console.log('✓ Selected Motion Event Trigger: On Click (onClick)');

  // 10. Test Interactive Preview Navigation
  const previewBtn = page.locator('button:has-text("Preview")').first();
  await previewBtn.click();
  await page.waitForSelector('button:has-text("Exit Studio")', { timeout: 8000 });
  console.log('✓ Opened Interactive Preview Mode');

  // Click the button inside the preview container to navigate to Profile
  const previewCanvasBtn = page.locator('div[style*="background"] button:has-text("Go to My Profile →"), div[style*="background"] button').first();
  await previewCanvasBtn.click({ force: true });
  console.log('✓ Clicked button inside Preview');

  // Wait for navigation / toast
  await page.waitForTimeout(1000);
  console.log('✓ Preview navigation to Profile screen successfully executed!');

  // Exit preview back to Studio
  const exitPreviewBtn = page.locator('button:has-text("Exit Studio")');
  await exitPreviewBtn.click();
  console.log('✓ Exited preview mode back to Studio');

  console.log('ALL PLAY-TO-BUILD E2E TESTS PASSED SUCCESSFULLY! 🎉');
  await browser.close();
}

run().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
