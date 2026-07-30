import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TEST_CREDENTIALS = {
  email: 'a3523110279@alumno.uttehuacan.edu.mx',
  password: 'Martinez24'
};

const BREAKPOINTS = [
  { key: 'desktop_large', label: 'Desktop XL', width: 2560, height: 1440, viewportWidth: 1920 },
  { key: 'desktop', label: 'Desktop', width: 1920, height: 1080, viewportWidth: 1366 },
  { key: 'laptop', label: 'Laptop', width: 1366, height: 768, viewportWidth: 1200 },
  { key: 'tablet', label: 'Tablet', width: 768, height: 1024, viewportWidth: 768 },
  { key: 'mobile', label: 'Móvil Standard', width: 390, height: 844, viewportWidth: 390 },
  { key: 'mobile_small', label: 'Móvil Pequeño', width: 320, height: 568, viewportWidth: 320 },
];

const reportsDir = 'audit-reports';
const screenshotsDir = path.join(reportsDir, 'screenshots');

interface AuditResult {
  breakpoint: string;
  status: 'pass' | 'fail';
  errors: string[];
  editorScreenshot?: string;
  menuScreenshot?: string;
  notes: string[];
}

const results: AuditResult[] = [];

function ensureDirectories() {
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshot(page, name: string): Promise<string> {
  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  return filename;
}

test.describe('Comprehensive Image Configuration Audit', () => {
  test.beforeAll(() => {
    ensureDirectories();
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 AUDITORÍA COMPLETA DE CONFIGURACIÓN DE IMÁGENES RESPONSIVAS');
    console.log('═'.repeat(80) + '\n');
  });

  for (const bp of BREAKPOINTS) {
    test(`audit breakpoint: ${bp.label}`, async ({ browser }) => {
      const result: AuditResult = {
        breakpoint: bp.label,
        status: 'pass',
        errors: [],
        notes: []
      };

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`🎯 AUDITANDO: ${bp.label} (${bp.key})`);
      console.log(`   Viewport: ${bp.viewportWidth}px`);
      console.log(`${'─'.repeat(80)}\n`);

      const adminContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      const adminPage = await adminContext.newPage();

      try {
        // 1. Login
        console.log('1️⃣ Iniciando sesión...');
        await adminPage.goto('http://localhost:3000/login');
        await adminPage.waitForLoadState('networkidle');

        await adminPage.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
        await adminPage.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
        await adminPage.locator('button:has-text("Iniciar sesión")').click();

        try {
          await adminPage.waitForURL('**/dashboard/**', { timeout: 10000 });
        } catch {
          await adminPage.waitForURL('**/admin/**', { timeout: 10000 });
        }
        await adminPage.waitForTimeout(1500);
        console.log('   ✅ Sesión iniciada\n');

        // 2. Navigate to Configuración
        console.log('2️⃣ Navegando a Configuración...');
        let configLink = adminPage.locator('a:has-text("Configuración")').first();
        if (!(await configLink.isVisible())) {
          configLink = adminPage.locator('button:has-text("Configuración")').first();
        }
        await configLink.click();
        await adminPage.waitForLoadState('networkidle');
        await adminPage.waitForTimeout(1000);
        console.log('   ✅ En Configuración\n');

        // 3. Open Dimensiones de Imagen tab
        console.log('3️⃣ Abriendo editor de Dimensiones de Imagen...');
        let dimensionesBtn = adminPage.locator('button:has-text("Dimensiones de Imagen")').first();
        await dimensionesBtn.click();
        await adminPage.waitForTimeout(1200);
        console.log('   ✅ Editor abierto\n');

        // 4. Select breakpoint
        console.log(`4️⃣ Seleccionando breakpoint: ${bp.label}...`);
        const bpBtn = adminPage.locator(`button:has-text("${bp.label}")`).first();
        if (await bpBtn.isVisible()) {
          await bpBtn.click();
          await adminPage.waitForTimeout(800);
          console.log('   ✅ Breakpoint seleccionado\n');
        } else {
          throw new Error(`No se encontró botón para ${bp.label}`);
        }

        // 5. Set Object Fit to "fill"
        console.log('5️⃣ Configurando Object Fit a "fill"...');
        const selects = adminPage.locator('select');
        const selectCount = await selects.count();

        if (selectCount === 0) {
          throw new Error('No se encontraron elementos select para Object Fit');
        }

        const objectFitSelect = selects.first();
        const beforeValue = await objectFitSelect.inputValue();
        console.log(`   Estado anterior: ${beforeValue}`);

        await objectFitSelect.selectOption('fill');
        const afterValue = await objectFitSelect.inputValue();
        console.log(`   ✅ Configurado a: ${afterValue}\n`);

        if (afterValue !== 'fill') {
          result.errors.push(`Object Fit no configurado a 'fill', obtenido: ${afterValue}`);
          result.status = 'fail';
        }

        // 6. Scroll to content and take editor screenshot
        console.log('6️⃣ Capturando screenshot del editor...');
        await adminPage.evaluate(() => window.scrollTo(0, 0));
        await adminPage.waitForTimeout(500);
        result.editorScreenshot = await takeScreenshot(adminPage, `editor-${bp.key}`);
        console.log(`   ✅ Screenshot guardado: ${result.editorScreenshot}\n`);

        // 7. Save configuration
        console.log('7️⃣ Guardando cambios...');
        const saveBtn = adminPage.locator('button:has-text("Guardar Cambios")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await adminPage.waitForTimeout(2000);
          console.log('   ✅ Cambios guardados\n');
          result.notes.push('Configuration saved successfully');
        } else {
          result.errors.push('No se encontró botón "Guardar Cambios"');
          result.status = 'fail';
        }

        // 8. Test persistence: reload page and verify configuration remains
        console.log('8️⃣ Probando persistencia (recargando página)...');
        await adminPage.reload();
        await adminPage.waitForLoadState('networkidle');
        await adminPage.waitForTimeout(1500);

        // Navigate back to config
        let configLink2 = adminPage.locator('a:has-text("Configuración")').first();
        if (!(await configLink2.isVisible())) {
          configLink2 = adminPage.locator('button:has-text("Configuración")').first();
        }
        await configLink2.click();
        await adminPage.waitForLoadState('networkidle');
        await adminPage.waitForTimeout(1000);

        // Open Dimensiones again
        let dimensionesBtn2 = adminPage.locator('button:has-text("Dimensiones de Imagen")').first();
        await dimensionesBtn2.click();
        await adminPage.waitForTimeout(1200);

        // Select breakpoint again
        const bpBtn2 = adminPage.locator(`button:has-text("${bp.label}")`).first();
        await bpBtn2.click();
        await adminPage.waitForTimeout(800);

        // Verify fill is still set
        const selects2 = adminPage.locator('select');
        const objectFitSelect2 = selects2.first();
        const persistedValue = await objectFitSelect2.inputValue();

        console.log(`   Object Fit después de recarga: ${persistedValue}`);

        if (persistedValue === 'fill') {
          console.log('   ✅ CONFIGURACIÓN PERSISTIDA\n');
          result.notes.push('Configuration persisted after reload');
        } else {
          console.log(`   ❌ CONFIGURACIÓN NO PERSISTIDA (esperado: fill, obtenido: ${persistedValue})\n`);
          result.errors.push(`Configuration not persisted. Expected 'fill', got '${persistedValue}'`);
          result.status = 'fail';
        }

        // 9. Navigate to public menu and take screenshot
        console.log('9️⃣ Navegando al menú público...');
        const publicContext = await browser.newContext({
          viewport: { width: bp.viewportWidth, height: bp.height }
        });
        const publicPage = await publicContext.newPage();

        // Navigate to public menu - adjust URL based on your app structure
        await publicPage.goto('http://localhost:3000/menu');
        await publicPage.waitForLoadState('networkidle');
        await publicPage.waitForTimeout(1500);
        console.log(`   ✅ En menú público con viewport ${bp.viewportWidth}x${bp.height}\n`);

        // Take public menu screenshot
        console.log('🔟 Capturando screenshot del menú público...');
        result.menuScreenshot = await takeScreenshot(publicPage, `menu-${bp.key}`);
        console.log(`   ✅ Screenshot guardado: ${result.menuScreenshot}\n`);

        result.notes.push('Public menu screenshot captured');

        await publicContext.close();

        console.log(`✅ RESULTADO: ${bp.label} - PASÓ\n`);

      } catch (error: any) {
        result.status = 'fail';
        result.errors.push(error.message);
        console.log(`❌ ERROR: ${error.message}\n`);
      } finally {
        await adminContext.close();
        results.push(result);
      }
    });
  }

  test.afterAll(() => {
    generateReport(results);
  });
});

function generateReport(allResults: AuditResult[]) {
  const passed = allResults.filter(r => r.status === 'pass').length;
  const failed = allResults.filter(r => r.status === 'fail').length;

  let report = `# 📊 Auditoría Completa - Configuración de Imágenes Responsivas\n\n`;
  report += `**Fecha:** ${new Date().toISOString()}\n`;
  report += `**Total de Breakpoints:** ${allResults.length}\n`;
  report += `**✅ Pasaron:** ${passed}/${allResults.length}\n`;
  report += `**❌ Fallaron:** ${failed}/${allResults.length}\n\n`;

  report += `## 📋 Resumen por Breakpoint\n\n`;
  report += `| Breakpoint | Estado | Errores | Notas |\n`;
  report += `|-----------|--------|---------|-------|\n`;

  allResults.forEach(result => {
    const status = result.status === 'pass' ? '✅ PASÓ' : '❌ FALLÓ';
    const errorCount = result.errors.length;
    const notes = result.notes.join('; ') || '-';
    report += `| ${result.breakpoint} | ${status} | ${errorCount} | ${notes} |\n`;
  });

  report += `\n## 📸 Detalles por Breakpoint\n\n`;

  allResults.forEach(result => {
    report += `### ${result.breakpoint}\n`;
    report += `**Estado:** ${result.status === 'pass' ? '✅ PASÓ' : '❌ FALLÓ'}\n\n`;

    if (result.editorScreenshot) {
      report += `**Editor:**\n![Editor](screenshots/${result.editorScreenshot})\n\n`;
    }

    if (result.menuScreenshot) {
      report += `**Menú Público:**\n![Menu](screenshots/${result.menuScreenshot})\n\n`;
    }

    if (result.notes.length > 0) {
      report += `**Notas:**\n`;
      result.notes.forEach(note => {
        report += `- ${note}\n`;
      });
      report += `\n`;
    }

    if (result.errors.length > 0) {
      report += `**Errores:**\n`;
      result.errors.forEach(error => {
        report += `- ⚠️ ${error}\n`;
      });
      report += `\n`;
    }

    report += `---\n\n`;
  });

  const reportPath = path.join(reportsDir, 'AUDIT_REPORT.md');
  fs.writeFileSync(reportPath, report);

  console.log('\n' + '═'.repeat(80));
  console.log('📊 REPORTE GENERADO');
  console.log('═'.repeat(80));
  console.log(`Archivo: ${reportPath}\n`);

  console.log('📋 RESUMEN EJECUTIVO:\n');
  console.log(`Total de Breakpoints: ${allResults.length}`);
  console.log(`✅ Pasaron: ${passed}`);
  console.log(`❌ Fallaron: ${failed}\n`);

  allResults.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${result.breakpoint}`);
    if (result.errors.length > 0) {
      result.errors.forEach(err => console.log(`   └─ ${err}`));
    }
  });

  console.log('\n' + '═'.repeat(80));
  if (failed === 0) {
    console.log('✅ TODAS LAS PRUEBAS PASARON');
  } else {
    console.log(`⚠️  ${failed} PRUEBA(S) FALLARON`);
  }
  console.log('═'.repeat(80) + '\n');
}
