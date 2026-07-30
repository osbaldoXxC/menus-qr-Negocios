import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  email: 'a3523110279@alumno.uttehuacan.edu.mx',
  password: 'Martinez24'
};

test('DEBUG: State flow for responsive image config - Desktop only', async ({ browser }) => {
  console.log('\n' + '═'.repeat(80));
  console.log('🔍 DEBUGGING STATE FLOW - DESKTOP ONLY');
  console.log('═'.repeat(80) + '\n');

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Capture ALL console messages
  page.on('console', msg => {
    console.log(`   [${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  try {
    // 1. Login
    console.log('1️⃣ Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
    await page.locator('button:has-text("Iniciar sesión")').click();

    try {
      await page.waitForURL('**/dashboard/**', { timeout: 20000 });
    } catch {
      await page.waitForURL('**/admin/**', { timeout: 20000 });
    }
    await page.waitForTimeout(2000);
    console.log('   ✅ Logged in\n');

    // 2. Navigate to Configuración
    console.log('2️⃣ Opening Configuration...');
    let configLink = page.locator('a:has-text("Configuración")').first();
    if (!(await configLink.isVisible())) {
      configLink = page.locator('button:has-text("Configuración")').first();
    }
    await configLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Configuration opened\n');

    // 3. Open Dimensiones de Imagen
    console.log('3️⃣ Opening Image Dimensions Editor...');
    const dimensionesBtn = page.locator('button:has-text("Dimensiones de Imagen")').first();
    const isTabVisible = await dimensionesBtn.isVisible();
    console.log(`   Tab button visible: ${isTabVisible}`);
    await dimensionesBtn.click();
    await page.waitForTimeout(1200);
    console.log('   ✅ Editor opened\n');

    // 4. Select Desktop
    console.log('4️⃣ Selecting Desktop breakpoint...');
    const desktopBtn = page.locator('button:has-text("Desktop")').first();
    await desktopBtn.click();
    await page.waitForTimeout(800);
    console.log('   ✅ Desktop selected\n');

    // 5. Log current value BEFORE change
    console.log('5️⃣ Checking current object-fit value...');
    const selectElement = page.locator('select').first();
    const beforeValue = await selectElement.inputValue();
    console.log(`   Before: ${beforeValue}\n`);

    // 6. Test: Call React's onChange directly with proper context
    console.log('6️⃣ Calling React onChange directly through fiber...');

    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('🟡') || text.includes('🔴') || text.includes('🟣') || text.includes('Updated config')) {
        console.log(`   [REACT] ${text}`);
      }
    });

    console.log('   Finding and calling React onChange handler...');
    const handlerCalled = await page.evaluate(async () => {
      const select = document.querySelector('select') as any;
      if (!select) {
        console.log('   ❌ Select not found');
        return false;
      }

      // Find React fiber
      const fiberKey = Object.keys(select).find(key => key.startsWith('__reactFiber'));
      if (!fiberKey) {
        console.log('   ❌ React fiber not found');
        return false;
      }

      const fiber = select[fiberKey];
      const onChange = fiber?.memoizedProps?.onChange;
      if (!onChange) {
        console.log('   ❌ onChange handler not found in fiber');
        return false;
      }

      console.log('   ✅ Found onChange handler');

      // Create a proper synthetic event
      const nativeEvent = new Event('change', { bubbles: true });
      const syntheticEvent = {
        target: select,
        currentTarget: select,
        nativeEvent: nativeEvent,
        preventDefault: () => {},
        stopPropagation: () => {},
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        type: 'change',
        timeStamp: Date.now()
      };

      // Set select value first
      select.value = 'fill';

      // Call onChange
      console.log('   Calling onChange with synthetic event');
      onChange(syntheticEvent);
      console.log('   onChange called');

      return true;
    });

    console.log(`   Handler called: ${handlerCalled ? 'YES' : 'NO'}`);

    await page.waitForTimeout(1500);

    const afterValue = await selectElement.inputValue();
    console.log(`   After calling onChange: ${afterValue}`);
    console.log(`   React logs: ${consoleLogs.filter(l => l.includes('🟡')).length > 0 ? 'YES ✅' : 'NO ❌'}\n`);

    // 7. Wait a bit for state to settle and verify state changed
    console.log('7️⃣ Waiting for state to settle...');
    await page.waitForTimeout(1500);

    // Log the current component state by checking the select value again
    const selectValueAfterWait = await selectElement.inputValue();
    console.log(`   Select value verified: ${selectValueAfterWait}`);

    // Try to access the React component's internal state
    const componentState = await page.evaluate(() => {
      const select = document.querySelector('select') as any;
      if (!select) {
        console.log('   ❌ Select not found');
        return null;
      }

      // Try to find React component info
      const propsKey = Object.keys(select).find(key => key.startsWith('__reactProps') || key.startsWith('__reactInternalInstance'));
      console.log(`   React props key found: ${propsKey ? 'yes' : 'no'}`);

      return {
        selectValue: select.value,
        selectDisplayValue: select.options?.[select.selectedIndex]?.textContent
      };
    });

    console.log(`   Component state: ${JSON.stringify(componentState)}\n`);

    // 8. Debug and click the save button
    console.log('8️⃣ Setting up request interception and clicking save...');
    let requestBody: any = null;
    page.on('request', request => {
      if (request.url().includes('/restaurants/theme')) {
        try {
          requestBody = request.postDataJSON();
          console.log('   📥 REQUEST INTERCEPTED:');
          console.log(`      responsive_imagen keys: ${Object.keys(requestBody?.config_diseno?.apariencia?.responsive_imagen || {}).join(', ')}`);
          if (requestBody?.config_diseno?.apariencia?.responsive_imagen?.desktop) {
            console.log(`      desktop.object_fit: ${requestBody.config_diseno.apariencia.responsive_imagen.desktop.object_fit}`);
          }
        } catch (e) {}
      }
    });

    // 8. Direct API call with the updated configuration
    console.log('8️⃣ Making direct API call with updated config...');

    // Read the auth token from localStorage
    const authToken = await page.evaluate(() => localStorage.getItem('access_token') || '');
    const restauranteId = await page.evaluate(() => localStorage.getItem('restaurante_id') || '');
    console.log(`   Token present: ${!!authToken}`);
    console.log(`   Restaurante ID: ${restauranteId}`);

    // Make the API call directly
    const apiResponse = await page.evaluate(({ token, restId }) => {
      try {
        const response = fetch('http://localhost:4000/api/restaurants/theme', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            config_diseno: {
              apariencia: {
                responsive_imagen: {
                  desktop: {
                    object_fit: 'fill',
                    position_x: 50,
                    position_y: 50,
                    width: 300,
                    height: 300,
                    opacity: 100,
                    border_radius: 0,
                    custom: true
                  }
                },
                fondo_tipo: 'imagen'
              }
            }
          })
        }).then(r => r.json());
        console.log('   ✅ API call successful');
        return { ok: true };
      } catch (err: any) {
        console.log('   ❌ API call failed:', err.message);
        return { ok: false, error: err.message };
      }
    }, { token: authToken, restId: restauranteId });

    console.log(`   API result: ${JSON.stringify(apiResponse)}`);

    await page.waitForTimeout(3000);
    console.log('');

    // 9. Check what was sent
    if (requestBody) {
      console.log('9️⃣ Analysis of sent data:');
      const responsive = requestBody?.config_diseno?.apariencia?.responsive_imagen;
      console.log(`   responsive_imagen is empty: ${Object.keys(responsive || {}).length === 0}`);
      console.log(`   responsive_imagen keys: ${Object.keys(responsive || {}).join(', ')}`);
      if (responsive?.desktop) {
        console.log(`   desktop.object_fit: ${responsive.desktop.object_fit}`);
        console.log(`   desktop keys: ${Object.keys(responsive.desktop).join(', ')}`);
      }
      console.log('');
    } else {
      console.log('9️⃣ ⚠️ Request body was not captured\n');
    }

  } catch (error: any) {
    console.log(`❌ ERROR: ${error.message}\n`);
    throw error;
  } finally {
    await context.close();
  }

  console.log('═'.repeat(80));
  console.log('🏁 DEBUG COMPLETE');
  console.log('═'.repeat(80) + '\n');
});
