import { test, expect } from '@playwright/test';

test('diagnose modal structure', async ({ page }) => {
  const testEmail = 'a3523110279@alumno.uttehuacan.edu.mx';
  const testPassword = 'Martinez24';

  console.log('\n📋 Iniciando diagnóstico del modal...\n');

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(testEmail);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(testPassword);

  const loginButton = page.locator('button:has-text("Iniciar sesión")');
  await loginButton.click();

  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Navegar a Configuración
  const configLink = page.locator('a:has-text("Configuración"), button:has-text("Configuración")').first();
  await configLink.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Abrir editor
  const dimensionesButton = page.locator('button:has-text("Dimensiones de Imagen"), button:has-text("Editar Imagen")').first();
  await dimensionesButton.click();
  await page.waitForTimeout(1500);

  // Diagnosticar estructura del modal
  console.log('🔍 Analizando estructura del modal...\n');

  // Buscar el modal/dialog
  const modals = page.locator('[role="dialog"], .modal, [class*="modal"], [class*="dialog"]');
  const modalCount = await modals.count();
  console.log(`📦 Encontrados ${modalCount} elementos de modal/dialog`);

  // Obtener todos los botones dentro del modal
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`\n🔘 Total de botones en la página: ${buttonCount}`);

  // Buscar botones específicos
  const saveButtons = page.locator('button:has-text("Guardar")');
  const saveButtonCount = await saveButtons.count();
  console.log(`💾 Botones con "Guardar": ${saveButtonCount}`);

  for (let i = 0; i < saveButtonCount; i++) {
    const btn = saveButtons.nth(i);
    const text = await btn.textContent();
    const isVisible = await btn.isVisible();
    const boundingBox = await btn.boundingBox();
    console.log(`   Botón ${i}: "${text}" - Visible: ${isVisible}, BBox: ${JSON.stringify(boundingBox)}`);
  }

  // Buscar el contenedor scrolleable
  console.log('\n📜 Buscando contenedores scrolleables...');
  const scrollContainers = page.locator('[class*="scroll"], [class*="overflow"]');
  const scrollCount = await scrollContainers.count();
  console.log(`   Encontrados ${scrollCount} contenedores potencialmente scrolleables`);

  // Tomar screenshot
  await page.screenshot({ path: 'modal-structure.png' });
  console.log('\n📸 Screenshot guardado: modal-structure.png');

  console.log('\n✅ Diagnóstico completado');
});
