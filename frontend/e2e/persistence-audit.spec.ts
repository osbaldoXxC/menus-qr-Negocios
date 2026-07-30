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
  sentData?: any;
  receivedData?: any;
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

test.describe('Image Configuration Persistence Audit', () => {
  test.beforeAll(() => {
    ensureDirectories();
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 AUDITORÍA DE PERSISTENCIA - CONFIGURACIÓN DE IMÁGENES');
    console.log('═'.repeat(80) + '\n');
  });

  for (const bp of BREAKPOINTS) {
    test(`test persistence: ${bp.label}`, async ({ browser, context }) => {
      const result: AuditResult = {
        breakpoint: bp.label,
        status: 'pass',
        errors: [],
        notes: []
      };

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`🎯 PROBANDO: ${bp.label} (${bp.key})`);
      console.log(`${'─'.repeat(80)}\n`);

      const page = await context.newPage();

      // Interceptar requests para logging
      let lastUpdateResponse: any = null;
      let lastUpdateRequest: any = null;

      page.on('response', async (response) => {
        if (response.url().includes('/restaurants/theme')) {
          try {
            lastUpdateResponse = await response.json();
            console.log('📤 Response from /restaurants/theme:');
            console.log(JSON.stringify(lastUpdateResponse, null, 2).substring(0, 500));
          } catch (e) {
            // Ignore parse errors
          }
        }
      });

      page.on('request', (request) => {
        if (request.url().includes('/restaurants/theme') && request.method() === 'PUT') {
          const postData = request.postDataJSON();
          lastUpdateRequest = postData;
          console.log('📥 Request to /restaurants/theme:');
          const config = postData?.config_diseno?.apariencia?.responsive_imagen;
          if (config) {
            console.log(`   Breakpoints en request: ${Object.keys(config).join(', ')}`);
            console.log(`   ${bp.label} config: ${JSON.stringify(config[bp.key])}`);
          }
        }
      });

      try {
        // 1. Login
        console.log('1️⃣ Iniciando sesión...');
        await page.goto('http://localhost:3000/login');
        await page.waitForLoadState('networkidle');

        await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
        await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
        await page.locator('button:has-text("Iniciar sesión")').click();

        try {
          await page.waitForURL('**/dashboard/**', { timeout: 10000 });
        } catch {
          await page.waitForURL('**/admin/**', { timeout: 10000 });
        }
        await page.waitForTimeout(1500);
        console.log('   ✅ Sesión iniciada\n');

        // 2. Navigate to Configuración
        console.log('2️⃣ Navegando a Configuración...');
        let configLink = page.locator('a:has-text("Configuración")').first();
        if (!(await configLink.isVisible())) {
          configLink = page.locator('button:has-text("Configuración")').first();
        }
        await configLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        console.log('   ✅ En Configuración\n');

        // 3. Open Dimensiones de Imagen tab
        console.log('3️⃣ Abriendo editor de Dimensiones de Imagen...');
        let dimensionesBtn = page.locator('button:has-text("Dimensiones de Imagen")').first();
        await dimensionesBtn.click();
        await page.waitForTimeout(1200);
        console.log('   ✅ Editor abierto\n');

        // 4. Select breakpoint
        console.log(`4️⃣ Seleccionando breakpoint: ${bp.label}...`);
        const bpBtn = page.locator(`button:has-text("${bp.label}")`).first();
        if (await bpBtn.isVisible()) {
          await bpBtn.click();
          await page.waitForTimeout(800);
          console.log('   ✅ Breakpoint seleccionado\n');
        } else {
          throw new Error(`No se encontró botón para ${bp.label}`);
        }

        // 5. Set Object Fit to "fill"
        console.log('5️⃣ Configurando Object Fit a "fill"...');
        const selects = page.locator('select');
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

        // 6. Take editor screenshot
        console.log('6️⃣ Capturando screenshot del editor...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        result.editorScreenshot = await takeScreenshot(page, `editor-${bp.key}`);
        console.log(`   ✅ Screenshot guardado: ${result.editorScreenshot}\n`);

        // 7. Save configuration
        console.log('7️⃣ Guardando cambios...');
        const saveBtn = page.locator('button:has-text("Guardar Cambios")').first();
        if (await saveBtn.isVisible()) {
          // Wait for network to be idle AFTER clicking save
          await Promise.all([
            page.waitForResponse(response => response.url().includes('/restaurants/theme')),
            saveBtn.click()
          ]);
          await page.waitForTimeout(2000);

          if (lastUpdateRequest) {
            result.sentData = lastUpdateRequest.config_diseno?.apariencia?.responsive_imagen?.[bp.key];
          }
          if (lastUpdateResponse) {
            const responseConfig = lastUpdateResponse.tema?.config_diseno?.apariencia?.responsive_imagen?.[bp.key];
            result.receivedData = responseConfig;
            console.log(`   📊 Respuesta del servidor:`, JSON.stringify(responseConfig));
          }

          console.log('   ✅ Cambios guardados\n');
          result.notes.push('Configuration saved successfully');
        } else {
          result.errors.push('No se encontró botón "Guardar Cambios"');
          result.status = 'fail';
        }

        // 8. Test persistence: reload page and verify configuration remains
        console.log('8️⃣ Probando persistencia (recargando página)...');
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);

        // Fetch fresh data
        console.log('9️⃣ Obteniendo configuración fresca del servidor...');
        const freshConfigResponse = await page.evaluate(() =>
          fetch('http://localhost:4000/api/restaurants/info').then(r => r.json())
        );

        const freshBreakpointConfig = freshConfigResponse?.config_diseno?.apariencia?.responsive_imagen?.[bp.key];
        console.log(`   Configuración en BD: ${JSON.stringify(freshBreakpointConfig)}`);

        const persistedFill = freshBreakpointConfig?.object_fit;
        console.log(`   Object Fit en BD: ${persistedFill}`);

        if (persistedFill === 'fill') {
          console.log('   ✅ CONFIGURACIÓN PERSISTIDA EN BD\n');
          result.notes.push('Configuration persisted in database');
        } else {
          console.log(`   ❌ CONFIGURACIÓN NO PERSISTIDA EN BD (esperado: fill, obtenido: ${persistedFill})\n`);
          result.errors.push(`Configuration not in DB. Expected 'fill', got '${persistedFill}'`);
          result.status = 'fail';
        }

        // 10. Navigate back to config UI and verify it loads the persisted value
        console.log('🔟 Verificando que el UI carga la configuración persistida...');
        let configLink2 = page.locator('a:has-text("Configuración")').first();
        if (!(await configLink2.isVisible())) {
          configLink2 = page.locator('button:has-text("Configuración")').first();
        }
        await configLink2.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Open Dimensiones again
        let dimensionesBtn2 = page.locator('button:has-text("Dimensiones de Imagen")').first();
        await dimensionesBtn2.click();
        await page.waitForTimeout(1200);

        // Select breakpoint again
        const bpBtn2 = page.locator(`button:has-text("${bp.label}")`).first();
        await bpBtn2.click();
        await page.waitForTimeout(800);

        // Verify fill is still set in UI
        const selects2 = page.locator('select');
        const objectFitSelect2 = selects2.first();
        const uiValue = await objectFitSelect2.inputValue();

        console.log(`   Object Fit en UI: ${uiValue}`);

        if (uiValue === 'fill') {
          console.log('   ✅ UI MUESTRA CONFIGURACIÓN PERSISTIDA\n');
          result.notes.push('UI loads persisted configuration');
        } else {
          console.log(`   ❌ UI NO MUESTRA CONFIGURACIÓN PERSISTIDA (esperado: fill, obtenido: ${uiValue})\n`);
          result.errors.push(`UI shows wrong value. Expected 'fill', got '${uiValue}'`);
          result.status = 'fail';
        }

        // 11. Determine final status
        if (result.status === 'pass') {
          console.log(`✅ RESULTADO: ${bp.label} - PASÓ\n`);
        } else {
          console.log(`❌ RESULTADO: ${bp.label} - FALLÓ\n`);
        }

      } catch (error: any) {
        result.status = 'fail';
        result.errors.push(error.message);
        console.log(`❌ ERROR: ${error.message}\n`);
      } finally {
        await page.close();
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

  let report = `# 📊 Auditoría de Persistencia - Configuración de Imágenes\n\n`;
  report += `**Fecha:** ${new Date().toISOString()}\n`;
  report += `**Total de Breakpoints:** ${allResults.length}\n`;
  report += `**✅ Pasaron:** ${passed}/${allResults.length}\n`;
  report += `**❌ Fallaron:** ${failed}/${allResults.length}\n\n`;

  report += `## 📋 Resumen\n\n`;
  report += `| Breakpoint | Estado | Datos Enviados | Datos Recibidos | Errores |\n`;
  report += `|-----------|--------|---|---|---|\n`;

  allResults.forEach(result => {
    const status = result.status === 'pass' ? '✅ PASÓ' : '❌ FALLÓ';
    const sent = result.sentData ? result.sentData.object_fit : '-';
    const received = result.receivedData ? result.receivedData.object_fit : '-';
    const errors = result.errors.length;
    report += `| ${result.breakpoint} | ${status} | ${sent} | ${received} | ${errors} |\n`;
  });

  report += `\n## 🔍 Detalles\n\n`;

  allResults.forEach(result => {
    report += `### ${result.breakpoint}\n`;
    report += `**Estado:** ${result.status === 'pass' ? '✅ PASÓ' : '❌ FALLÓ'}\n\n`;

    if (result.sentData) {
      report += `**Datos Enviados (Request):**\n\`\`\`json\n${JSON.stringify(result.sentData, null, 2)}\n\`\`\`\n\n`;
    }

    if (result.receivedData) {
      report += `**Datos Recibidos (Response):**\n\`\`\`json\n${JSON.stringify(result.receivedData, null, 2)}\n\`\`\`\n\n`;
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

  const reportPath = path.join(reportsDir, 'PERSISTENCE_AUDIT.md');
  fs.writeFileSync(reportPath, report);

  console.log('\n' + '═'.repeat(80));
  console.log('📊 REPORTE GENERADO');
  console.log('═'.repeat(80));
  console.log(`Archivo: ${reportPath}\n`);

  console.log('📋 RESUMEN EJECUTIVO:\n');
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
