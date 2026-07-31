const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- STARTING PLAYWRIGHT TESTS ---');

  try {
    // 1. Log into Admin (localhost:3001)
    console.log('Testing Admin Login...');
    await page.goto('http://localhost:3001');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-1-login.png' });
    
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await page.fill('input[type="email"]', 'admin@mexxican.mx');
      await page.fill('input[type="password"]', 'Admin12345!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'debug-2-dashboard.png' });
    } else {
      console.log('No login form found, maybe already logged in?');
      await page.screenshot({ path: 'debug-2-no-login-form.png' });
    }
    
    console.log('Admin: Checking Tabs...');
    const bodyText = await page.innerText('body');
    console.log('BODY TEXT STARTS WITH:', bodyText.substring(0, 100));

    const tabsText = await page.innerText('.filter-tabs');
    console.log('Tabs Text:', tabsText);
    if (!tabsText.includes('Soporte Premium')) {
      throw new Error('Soporte Premium tab NOT FOUND');
    }
    console.log('✅ Soporte Premium tab found');

    // Go to Soporte tab
    await page.click('text="Soporte Premium"');
    await page.waitForTimeout(1000);
    
    const adminSupportExists = await page.$('.admin-support-container');
    if (!adminSupportExists) {
      throw new Error('AdminSupport component not rendering');
    }
    console.log('✅ AdminSupport component is rendering properly');

    console.log('All tests passed successfully.');

  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
