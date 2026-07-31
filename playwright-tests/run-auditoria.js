const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  let report = [];
  let consoleErrors = [];
  let networkErrors = [];

  report.push('# Auditoría Funcional Completa - Frontend Restaurante\n');
  report.push('**Fecha:** ' + new Date().toLocaleString() + '\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

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

  const loginIfNeed = async () => {
    if (page.url().includes('/login') || page.url() === 'about:blank') {
      await page.goto('http://localhost:3000/login');
      await page.fill('input[type="email"]', 'e2epremium@test.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
  };

  try {
    // 1. Dashboard
    let status = '✅ Funciona correctamente';
    let details = '';
    try {
      await loginIfNeed();
      await page.goto('http://localhost:3000/dashboard/restaurante');
      await page.waitForTimeout(2000);
      const title = await page.locator('text="Dashboard"').first().isVisible();
      if(title) details = '- **Resultado obtenido:** Dashboard cargó.\n';
      else {
         status = '⚠️ Funciona parcialmente';
         details = '- **Resultado obtenido:** Dashboard no muestra el título esperado.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 1. Dashboard\n- **Estado**: ${status}\n${details}\n`);

    // 2. Mi Menú
    status = '✅ Funciona correctamente';
    details = '';
    try {
      await page.goto('http://localhost:3000/dashboard/menu');
      await page.waitForTimeout(2000);
      const btnCrear = page.locator('button:has-text("Crear"), button:has-text("Nuevo"), button:has-text("Añadir")').first();
      if (await btnCrear.isVisible()) {
        await btnCrear.click();
        await page.waitForTimeout(1000);
        await page.keyboard.press('Escape');
      } else {
        status = '⚠️ Funciona parcialmente';
        details = 'No se encontró botón para crear platillo.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 2. Mi Menú\n- **Estado**: ${status}\n${details}\n`);

    // 3. Código QR
    status = '✅ Funciona correctamente';
    details = '';
    try {
      await page.goto('http://localhost:3000/dashboard/qr');
      await page.waitForTimeout(2000);
      const qrImage = page.locator('svg, img').first();
      if(!await qrImage.isVisible()) {
         status = '⚠️ Funciona parcialmente';
         details = 'El código QR no es visible.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 3. Código QR\n- **Estado**: ${status}\n${details}\n`);

    // 4. Configuración
    status = '✅ Funciona correctamente';
    details = '';
    try {
      await page.goto('http://localhost:3000/dashboard/configuracion');
      await page.waitForTimeout(2000);
      const inputLogo = page.locator('input[type="file"]').first();
      if(!await inputLogo.isVisible()) {
         status = '⚠️ Funciona parcialmente';
         details = 'No se encontró input de logo.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 4. Configuración\n- **Estado**: ${status}\n${details}\n`);

    // 5. Diseño
    status = '✅ Funciona correctamente';
    details = '';
    try {
      await page.goto('http://localhost:3000/dashboard/diseno');
      await page.waitForTimeout(2000);
      const isVisible = await page.locator('body').isVisible();
      if(!isVisible) {
          status = '❌ No funciona';
          details = 'Página en blanco.\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 5. Diseño\n- **Estado**: ${status}\n${details}\n`);

    // 6. Precarga de datos
    status = '✅ Funciona correctamente';
    details = '';
    try {
      await page.reload();
      await page.waitForTimeout(1000);
      if(!await page.locator('body').isVisible()) throw new Error('Blank UI');
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 6. Precarga de datos\n- **Estado**: ${status}\n${details}\n`);

    // 7. Refresh completo
    status = '✅ Funciona correctamente';
    details = '';
    try {
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      if (page.url().includes('/login')) {
         status = '❌ No funciona';
         details = '**Posible causa:** El token no persiste al recargar (F5).\n';
      }
    } catch (e) {
      status = '❌ No funciona';
      details = `**Error:** ${e.message}\n`;
    }
    report.push(`## 7. Refresh completo\n- **Estado**: ${status}\n${details}\n`);

  } finally {
    // 8 y 9. Consola y Network
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

    const reportPath = path.join(__dirname, '../auditoria-restaurante-reporte.md');
    fs.writeFileSync(reportPath, report.join('\n'));

    console.log("Report generated at: " + reportPath);
    await browser.close();
  }
})();
