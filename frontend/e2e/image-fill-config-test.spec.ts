import { test, expect } from '@playwright/test';

test.describe('Image Fill Configuration Flow', () => {
  test('should configure image fill for horizontal and vertical screens and persist changes', async ({ page }) => {
    const testEmail = 'a3523110279@alumno.uttehuacan.edu.mx';
    const testPassword = 'Martinez24';

    console.log('🚀 Iniciando test de configuración de imágenes con Fill...\n');

    // 1. Login
    console.log('1️⃣ Navegando a la página de login...');
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
    console.log('   ✓ Sesión iniciada\n');

    // 2. Navegar a Configuración
    console.log('2️⃣ Navegando a Configuración...');
    const configLink = page.locator('a:has-text("Configuración"), button:has-text("Configuración")').first();
    await configLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✓ En página de Configuración\n');

    // 3. Click en tab "Dimensiones de Imagen"
    console.log('3️⃣ Abriendo editor de Dimensiones de Imagen...');
    const dimensionesTab = page.locator('button:has-text("Dimensiones de Imagen")').first();
    await dimensionesTab.click();
    await page.waitForTimeout(1000);

    // Esperar a que aparezca el editor (con los breakpoints)
    await page.waitForSelector('button:has-text("Desktop"), button:has-text("Mobile")', { timeout: 5000 });
    console.log('   ✓ Editor abierto\n');

    // 4. Configurar Desktop (Horizontal)
    console.log('4️⃣ Configurando HORIZONTAL (Desktop)...');
    const desktopButton = page.locator('button:has-text("Desktop")').first();
    await desktopButton.click();
    await page.waitForTimeout(800);

    // Cambiar Object Fit a "fill"
    const selectDesktop = page.locator('select').first();
    await selectDesktop.selectOption('fill');
    const desktopValue = await selectDesktop.inputValue();
    console.log(`   ✓ Object Fit Desktop: ${desktopValue}\n`);

    // 5. Configurar Mobile (Vertical)
    console.log('5️⃣ Configurando VERTICAL (Móvil Standard)...');
    const mobileButton = page.locator('button:has-text("Móvil Standard")').first();
    await mobileButton.click();
    await page.waitForTimeout(800);

    // Cambiar Object Fit a "fill"
    const selectMobile = page.locator('select').first();
    await selectMobile.selectOption('fill');
    const mobileValue = await selectMobile.inputValue();
    console.log(`   ✓ Object Fit Móvil: ${mobileValue}\n`);

    // 6. NO cerrar el modal, directamente scroll al botón de guardar
    console.log('6️⃣ Scrolleando hacia el botón de guardar (se mantiene abierto)...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    console.log('   ✓ Listo para guardar\n');

    // 7. Guardar cambios principales con el botón superior
    console.log('7️⃣ Guardando cambios principales...');
    const saveMainButton = page.locator('button:has-text("Guardar Cambios")').first();

    // El botón está en la esquina superior derecha
    await page.waitForTimeout(300);
    await saveMainButton.click();
    await page.waitForTimeout(2000);
    console.log('   ✓ Cambios guardados\n');

    // 8. Verificar que los cambios se guardaron (reload la página)
    console.log('8️⃣ Navegando a Panel de Control para validar...');
    const dashboardLink = page.locator('a:has-text("Panel de Control"), button:has-text("Dashboard")').first();
    await dashboardLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('   ✓ En Panel de Control\n');

    // 9. Regresar a Configuración
    console.log('9️⃣ Regresando a Configuración...');
    const configLink2 = page.locator('a:has-text("Configuración"), button:has-text("Configuración")').first();
    await configLink2.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✓ Regresado a Configuración\n');

    // 10. Abrir editor nuevamente para verificar
    console.log('🔟 Verificando que los cambios se guardaron...');
    const dimensionesTab2 = page.locator('button:has-text("Dimensiones de Imagen")').first();
    await dimensionesTab2.click();
    await page.waitForTimeout(1000);
    await page.waitForSelector('select', { timeout: 5000 });

    // Verificar Desktop
    console.log('1️⃣1️⃣ Verificando Desktop...');
    const desktopButton2 = page.locator('button:has-text("Desktop")').first();
    await desktopButton2.click();
    await page.waitForTimeout(800);

    const selectDesktop2 = page.locator('select').first();
    const desktopFinalValue = await selectDesktop2.inputValue();
    console.log(`   ✓ Desktop Object Fit: ${desktopFinalValue}`);
    expect(desktopFinalValue).toBe('fill');

    // Verificar Mobile
    console.log('1️⃣2️⃣ Verificando Móvil...');
    const mobileButton2 = page.locator('button:has-text("Móvil Standard")').first();
    await mobileButton2.click();
    await page.waitForTimeout(800);

    const selectMobile2 = page.locator('select').first();
    const mobileFinalValue = await selectMobile2.inputValue();
    console.log(`   ✓ Móvil Object Fit: ${mobileFinalValue}`);
    expect(mobileFinalValue).toBe('fill');

    console.log('\n✅ ¡Test completado exitosamente! Los cambios se guardaron correctamente.');
  });
});
