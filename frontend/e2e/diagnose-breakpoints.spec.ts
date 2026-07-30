import { test } from '@playwright/test';

test('diagnose breakpoint buttons', async ({ page }) => {
  const testEmail = 'a3523110279@alumno.uttehuacan.edu.mx';
  const testPassword = 'Martinez24';

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"]').fill(testEmail);
  await page.locator('input[type="password"]').fill(testPassword);
  await page.locator('button:has-text("Iniciar sesión")').click();

  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Navegar a Configuración
  await page.locator('a:has-text("Configuración")').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click en tab Dimensiones
  await page.locator('button:has-text("Dimensiones de Imagen")').first().click();
  await page.waitForTimeout(1500);

  console.log('\n🔍 Buscando botones de breakpoints...\n');

  // Buscar todos los botones
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`Total de botones: ${buttonCount}\n`);

  console.log('📋 Botones encontrados:');
  for (let i = 0; i < buttonCount; i++) {
    const btn = buttons.nth(i);
    const text = await btn.textContent();
    const isVisible = await btn.isVisible();
    if (text && text.trim().length > 0 && isVisible) {
      console.log(`   ${i}: "${text.trim()}"`);
    }
  }

  // Buscar específicamente por clases que identifiquen breakpoints
  console.log('\n🔎 Buscando por patrones de breakpoints...');
  const breakpointCandidates = page.locator('[class*="breakpoint"], [class*="responsive"], button[class*="active"]');
  const bpCount = await breakpointCandidates.count();
  console.log(`Elementos con atributos de breakpoint: ${bpCount}`);

  for (let i = 0; i < Math.min(bpCount, 10); i++) {
    const elem = breakpointCandidates.nth(i);
    const text = await elem.textContent();
    const classes = await elem.getAttribute('class');
    console.log(`   ${i}: "${text?.trim()}" - clase: ${classes}`);
  }

  // Tomar screenshot
  await page.screenshot({ path: 'breakpoints-debug.png' });
  console.log('\n📸 Screenshot guardado: breakpoints-debug.png\n');
});
