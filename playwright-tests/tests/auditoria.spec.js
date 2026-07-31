const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe.serial('Auditoria Funcional - Restaurante', () => {
  let report = [];
  let consoleErrors = [];
  let networkErrors = [];

  test.beforeAll(async () => {
    report.push('# Auditoría Funcional Completa - Frontend Restaurante\n');
    report.push('**Fecha:** ' + new Date().toLocaleString() + '\n');
  });

  test.afterAll(async () => {
    report.push('## 8. Consola (capturar errores)\n');
    if (consoleErrors.length > 0) {
      report.push('- **Estado**: 🐛 Error encontrado');
      consoleErrors.forEach(err => report.push(`- ${err}`));
    } else {
      report.push('- **Estado**: ✅ Funciona correctamente (sin errores de consola)');
    }
    
    report.push('\n## 9. Network (capturar requests fallidas)\n');
    if (networkErrors.length > 0) {
      report.push('- **Estado**: 🐛 Error encontrado');
      networkErrors.forEach(err => report.push(`- ${err}`));
    } else {
      report.push('- **Estado**: ✅ Funciona correctamente (sin requests fallidas)');
    }

    const reportPath = path.join(__dirname, '../../auditoria-restaurante-reporte.md');
    fs.writeFileSync(reportPath, report.join('\n'));
  });

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Consola] ${msg.text()}`);
      }
    });

    page.on('response', response => {
      if (!response.ok() && response.status() >= 400 && response.request().resourceType() === 'fetch') {
        networkErrors.push(`[Network] Error ${response.status()}: ${response.url()}`);
      }
    });
  });

  test('Módulo 1: Dashboard y Login', async ({ page }) => {
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      await page.goto('http://localhost:3000/login');
      await page.fill('input[type="email"]', 'e2epremium@test.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      
      // Intentar esperar a la redirección
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      
      // Intentar ubicar un elemento del dashboard
      const dashTitle = page.locator('text="Dashboard"').first();
      if(await dashTitle.isVisible()) {
          details += '- **Resultado obtenido:** Dashboard cargó correctamente.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Módulo:** Dashboard\n**Página:** /dashboard/restaurante\n**Pasos para reproducir:** Iniciar sesión e ir al dashboard\n**Resultado esperado:** El dashboard carga con la vista del restaurante\n**Resultado obtenido:** ${e.message}\n**Evidencia:** Screenshot / Error log\n**Posible causa:** Fallo en autenticación o redirección\n**Severidad:** Crítica\n`;
    }
    report.push(`## 1. Dashboard\n- **Estado**: ${status}\n${details}\n`);
    // Guardar estado de la sesion para los siguientes tests. Usamos storageState en Playwright, pero por simplicidad navegaremos en cada test usando la misma sesión persistente.
  });

  // Re-usaremos la sesión iniciando en cada test si es necesario
  const loginIfNeed = async (page) => {
      await page.goto('http://localhost:3000/dashboard');
      if (page.url().includes('/login')) {
          await page.fill('input[type="email"]', 'e2epremium@test.com');
          await page.fill('input[type="password"]', 'Password123!');
          await page.click('button[type="submit"]');
          await page.waitForURL('**/dashboard**', { timeout: 10000 });
      }
  };

  test('Módulo 2: Mi Menú (disponibilidad y crear platillo)', async ({ page }) => {
    await loginIfNeed(page);
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      // Buscar link al menú
      const menuLink = page.locator('a[href*="/menu"], a:has-text("Mi Menú"), a:has-text("Menú")').first();
      await menuLink.click();
      await page.waitForTimeout(2000);
      
      const btnCrear = page.locator('button:has-text("Crear"), button:has-text("Nuevo"), button:has-text("Añadir")').first();
      if (await btnCrear.isVisible()) {
        await btnCrear.click();
        await page.waitForTimeout(1000);
        // Validar que se abra el modal
        const modalForm = page.locator('form').first();
        if(await modalForm.isVisible()) {
            await page.keyboard.press('Escape'); // cerrar modal
        }
      } else {
        status = '⚠️ Funciona parcialmente';
        details = `**Módulo:** Mi Menú\n**Página:** /dashboard/menu\n**Pasos:** Click en Mi Menú, buscar botón Crear\n**Resultado esperado:** Botón de crear platillo visible\n**Resultado obtenido:** No se encontró botón.\n**Severidad:** Alta\n`;
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Módulo:** Mi Menú\n**Error:** ${e.message}\n**Severidad:** Alta\n`;
    }
    report.push(`## 2. Mi Menú\n- **Estado**: ${status}\n${details}\n`);
  });

  test('Módulo 3: Código QR', async ({ page }) => {
    await loginIfNeed(page);
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      const qrLink = page.locator('a[href*="/qr"], a:has-text("Código QR"), a:has-text("QR")').first();
      await qrLink.click();
      await page.waitForTimeout(2000);
      
      const qrImage = page.locator('svg, img').first();
      if(!await qrImage.isVisible()) {
         status = '⚠️ Funciona parcialmente';
         details = 'El código QR no es visible en pantalla.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Módulo:** Código QR\n**Error:** ${e.message}\n**Severidad:** Media\n`;
    }
    report.push(`## 3. Código QR\n- **Estado**: ${status}\n${details}\n`);
  });

  test('Módulo 4: Configuración (Logo, Colores, Tipo de menú, Imagen)', async ({ page }) => {
    await loginIfNeed(page);
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      const configLink = page.locator('a[href*="/config"], a:has-text("Configuración")').first();
      await configLink.click();
      await page.waitForTimeout(2000);
      
      const inputLogo = page.locator('input[type="file"]').first();
      if(!await inputLogo.isVisible()) {
         status = '⚠️ Funciona parcialmente';
         details = 'No se encontró input de imagen o configuración.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 4. Configuración\n- **Estado**: ${status}\n${details}\n`);
  });

  test('Módulo 5: Diseño (banner promocional, estructura)', async ({ page }) => {
    await loginIfNeed(page);
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      const disenoLink = page.locator('a[href*="/diseno"], a:has-text("Diseño")').first();
      if(await disenoLink.isVisible()) {
          await disenoLink.click();
          await page.waitForTimeout(2000);
      } else {
          status = '⚠️ Funciona parcialmente';
          details = 'No hay enlace explícito a Diseño.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 5. Diseño\n- **Estado**: ${status}\n${details}\n`);
  });

  test('Módulo 6: Precarga de datos', async ({ page }) => {
    await loginIfNeed(page);
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      await page.reload();
      // Verificar si hay skeletons o si la UI explota
      await page.waitForTimeout(1000);
      const isVisible = await page.locator('body').isVisible();
      if(!isVisible) throw new Error('UI is blank after reload');
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 6. Precarga de datos\n- **Estado**: ${status}\n${details}\n`);
  });

  test('Módulo 7: Refresh completo', async ({ page }) => {
    await loginIfNeed(page);
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      if (page.url().includes('/login')) {
         status = '❌ No funciona';
         details = '**Posible causa:** El refresh desconecta al usuario (token no persiste).\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 7. Refresh completo\n- **Estado**: ${status}\n${details}\n`);
  });

});
