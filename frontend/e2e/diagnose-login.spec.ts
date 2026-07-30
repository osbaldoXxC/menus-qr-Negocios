import { test, expect } from '@playwright/test';

test('diagnose login page structure', async ({ page }) => {
  console.log('\n📋 Iniciando diagnóstico de página de login...\n');

  // Navegar a la aplicación
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Tomar screenshot
  await page.screenshot({ path: 'login-page.png' });
  console.log('📸 Screenshot guardado: login-page.png\n');

  // Obtener el HTML completo
  const htmlContent = await page.content();
  console.log('📄 HTML de la página:');
  console.log('===================================');
  console.log(htmlContent.substring(0, 2000));
  console.log('...\n');

  // Buscar todos los inputs
  const inputs = page.locator('input');
  const inputCount = await inputs.count();
  console.log(`🔍 Encontrados ${inputCount} inputs:`);
  for (let i = 0; i < Math.min(inputCount, 10); i++) {
    const input = inputs.nth(i);
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    console.log(`   Input ${i}: type="${type}", placeholder="${placeholder}", name="${name}", id="${id}"`);
  }

  // Buscar todos los botones
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`\n🔘 Encontrados ${buttonCount} botones:`);
  for (let i = 0; i < Math.min(buttonCount, 10); i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    console.log(`   Button ${i}: "${text}"`);
  }

  // Buscar formularios
  const forms = page.locator('form');
  const formCount = await forms.count();
  console.log(`\n📝 Encontrados ${formCount} formularios`);

  // Buscar elementos por texto
  console.log('\n🔎 Buscando elementos por texto:');
  const emailElements = await page.locator('text=/email|correo|e-mail/i').all();
  console.log(`   Elementos con "email": ${emailElements.length}`);

  const passwordElements = await page.locator('text=/password|contraseña|clave/i').all();
  console.log(`   Elementos con "password": ${passwordElements.length}`);

  const loginElements = await page.locator('text=/login|ingresar|entrar|sign in/i').all();
  console.log(`   Elementos con "login": ${loginElements.length}`);

  console.log('\n✅ Diagnóstico completado');
});
