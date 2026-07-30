import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TEST_CREDENTIALS = {
  email: 'a3523110279@alumno.uttehuacan.edu.mx',
  password: 'Martinez24'
};

const PUBLIC_MENU_URL = 'http://localhost:3000/menu/51ad632a-403d-426e-bfb4-2d32a448bb7b';

const BREAKPOINTS = [
  { key: 'desktop_large', label: 'Desktop XL', width: 2560, height: 1440, viewportW: 1920, viewportH: 1080 },
  { key: 'desktop', label: 'Desktop', width: 1920, height: 1080, viewportW: 1440, viewportH: 900 },
  { key: 'laptop', label: 'Laptop', width: 1366, height: 768, viewportW: 1200, viewportH: 800 },
  { key: 'tablet', label: 'Tablet', width: 768, height: 1024, viewportW: 768, viewportH: 1024 },
  { key: 'mobile', label: 'Móvil Standard', width: 390, height: 844, viewportW: 390, viewportH: 844 },
  { key: 'mobile_small', label: 'Móvil Pequeño', width: 320, height: 568, viewportW: 320, viewportH: 568 },
];

const artifactsDir = 'C:/Users/Baldo/.gemini/antigravity-cli/brain/6a12e783-6f3a-4bae-a4e7-1651604f2760/audit_screenshots';

function ensureDirectories() {
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
}

export interface BreakpointAuditResult {
  key: string;
  label: string;
  viewport: string;
  status: 'PASS' | 'FAIL';
  objectFitRequested: string;
  objectFitEditor: string;
  objectFitPublic: string;
  editorScreenshotPath: string;
  publicScreenshotPath: string;
  persistedCorrectly: boolean;
  notes: string[];
  bugsFound: any[];
}

const auditSummary: BreakpointAuditResult[] = [];

test.describe('Auditoría Completa de Configuración de Imágenes (Playwright)', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.setTimeout(60000); // Allow 60 seconds per breakpoint test
  });

  test.beforeAll(() => {
    ensureDirectories();
    console.log('🚀 Iniciando auditoría Playwright con menú público real...');
  });

  for (const bp of BREAKPOINTS) {
    test(`Auditoría de resolución: ${bp.label} (${bp.key})`, async ({ browser }) => {
      console.log(`\n========================================`);
      console.log(`🔍 AUDITANDO: ${bp.label} (${bp.width}x${bp.height})`);
      console.log(`========================================`);

      const result: BreakpointAuditResult = {
        key: bp.key,
        label: bp.label,
        viewport: `${bp.viewportW}x${bp.viewportH}`,
        status: 'PASS',
        objectFitRequested: 'fill',
        objectFitEditor: '',
        objectFitPublic: '',
        editorScreenshotPath: '',
        publicScreenshotPath: '',
        persistedCorrectly: false,
        notes: [],
        bugsFound: []
      };

      const adminContext = await browser.newContext({
        viewport: { width: 1440, height: 900 }
      });
      const adminPage = await adminContext.newPage();
      adminPage.on('console', msg => {
        console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
      });
      adminPage.on('response', response => {
        if (response.url().includes('/api/')) {
          console.log(`[NETWORK] ${response.status()} ${response.url()}`);
        }
      });

      try {
        // 1. Iniciar sesión en Editor / Admin
        console.log('1. Iniciando sesión...');
        await adminPage.goto('http://localhost:3000/login');
        await adminPage.waitForLoadState('networkidle');

        await adminPage.fill('input[type="email"]', TEST_CREDENTIALS.email);
        await adminPage.fill('input[type="password"]', TEST_CREDENTIALS.password);
        await adminPage.click('button:has-text("Iniciar sesión")');

        await adminPage.waitForURL(url => url.pathname.includes('/dashboard') || url.pathname.includes('/configuracion'), { timeout: 15000 });
        await adminPage.waitForTimeout(500);
        console.log('   ✅ Sesión iniciada');

        // 2. Navegar a Configuración -> Dimensiones de Imagen
        console.log('2. Accediendo a Configuraciones del menú -> Dimensiones de Imagen...');
        let configLink = adminPage.locator('a:has-text("Configuración")').first();
        if (!(await configLink.isVisible())) {
          configLink = adminPage.locator('button:has-text("Configuración")').first();
        }
        await configLink.click();
        await adminPage.waitForLoadState('networkidle');
        await adminPage.waitForTimeout(500);

        const dimensionesBtn = adminPage.locator('button:has-text("Dimensiones de Imagen")').first();
        await expect(dimensionesBtn).toBeVisible({ timeout: 10000 });
        await dimensionesBtn.click();
        await adminPage.waitForTimeout(500);
        console.log('   ✅ Modal/Editor de Dimensiones de Imagen abierto');

        // 3. Seleccionar la resolución específica
        console.log(`3. Seleccionando resolución "${bp.label}"...`);
        const bpBtn = adminPage.locator(`button:has-text("${bp.label}")`).first();
        await expect(bpBtn).toBeVisible();
        await bpBtn.click();
        await adminPage.waitForTimeout(500);
        console.log(`   ✅ Resolución ${bp.label} seleccionada`);

        // 4. Ir a Tamaño y posición -> Acomodo de imagen -> Estirar (Fill)
        console.log('4. Configurando Acomodo de Imagen -> Estirar (Fill)...');
        const selectElement = adminPage.locator('select[data-testid="object-fit-select"]').first();
        await selectElement.selectOption('fill');
        await adminPage.waitForTimeout(300);

        const currentSelectVal = await selectElement.inputValue();
        result.objectFitEditor = currentSelectVal;
        console.log(`   Valor de Acomodo de Imagen en editor: ${currentSelectVal}`);

        if (currentSelectVal !== 'fill') {
          result.status = 'FAIL';
          result.bugsFound.push({
            step: 'Seleccionar Estirar (Fill)',
            expected: 'fill',
            observed: currentSelectVal,
            description: 'El selector de Acomodo de Imagen no conservó el valor "fill".'
          });
        }

        // 5. Verificar estilos de la imagen en el lienzo del editor
        const editorImg = adminPage.locator('img[alt="Fondo interactivo"]').first();
        if (await editorImg.isVisible()) {
          const objectFitCss = await editorImg.evaluate(el => window.getComputedStyle(el).objectFit);
          console.log(`   CSS object-fit en imagen del editor: ${objectFitCss}`);
          result.notes.push(`Editor Canvas CSS object-fit: ${objectFitCss}`);
        }

        // 6. Tomar captura de pantalla del editor
        const editorScreenshotName = `EDITOR_${bp.key}.png`;
        const editorScreenshotFullPath = path.join(artifactsDir, editorScreenshotName);
        await adminPage.screenshot({ path: editorScreenshotFullPath, fullPage: false });
        result.editorScreenshotPath = editorScreenshotFullPath;
        console.log(`   📸 Captura del Editor guardada: ${editorScreenshotName}`);

        // 7. Guardar configuración
        console.log('7. Guardando configuración...');
        const saveBtn = adminPage.locator('button[data-testid="save-responsive-config"]').first();
        await saveBtn.evaluate((node: HTMLButtonElement) => node.click());
        await adminPage.waitForLoadState('networkidle');
        await adminPage.waitForTimeout(3000);
        console.log('   ✅ Configuración guardada');

        // 8. Verificar Persistencia al Recargar la Página
        console.log('8. Probando persistencia al recargar...');
        await adminPage.reload();
        await adminPage.waitForLoadState('networkidle');
        await adminPage.waitForTimeout(500);
        console.log(`[TEST] URL after reload: ${adminPage.url()}`);

        let configLink2 = adminPage.locator('a:has-text("Configuración")').first();
        if (!(await configLink2.isVisible())) {
          configLink2 = adminPage.locator('button:has-text("Configuración")').first();
        }
        await configLink2.click();
        await adminPage.waitForLoadState('networkidle');

        const dimBtnReload = adminPage.locator('button:has-text("Dimensiones de Imagen")').first();
        await dimBtnReload.click();
        await adminPage.waitForTimeout(500);

        const bpBtnReload = adminPage.locator(`button:has-text("${bp.label}")`).first();
        await bpBtnReload.click();
        await adminPage.waitForTimeout(500);

        const selectReloadVal = await adminPage.locator('select[data-testid="object-fit-select"]').first().inputValue();
        if (selectReloadVal === 'fill') {
          result.persistedCorrectly = true;
          console.log('   ✅ Persistencia verificada: "fill" se mantiene tras recargar');
        } else {
          result.persistedCorrectly = false;
          result.status = 'FAIL';
          result.bugsFound.push({
            step: 'Persistencia tras recargar',
            expected: 'fill',
            observed: selectReloadVal,
            description: `Al recargar la página y volver a ${bp.label}, el acomodo volvió a "${selectReloadVal}".`
          });
        }

        // 9. Abrir Menú Público con el Viewport de la resolución
        console.log(`9. Abriendo menú público con viewport ${bp.viewportW}x${bp.viewportH}...`);
        const publicContext = await browser.newContext({
          viewport: { width: bp.viewportW, height: bp.viewportH }
        });
        const publicPage = await publicContext.newPage();

        await publicPage.goto(PUBLIC_MENU_URL);
        await publicPage.waitForLoadState('networkidle');
        await publicPage.waitForTimeout(1000);

        // 10. Tomar captura de pantalla del menú público
        const publicScreenshotName = `MENU_${bp.key}.png`;
        const publicScreenshotFullPath = path.join(artifactsDir, publicScreenshotName);
        await publicPage.screenshot({ path: publicScreenshotFullPath, fullPage: false });
        result.publicScreenshotPath = publicScreenshotFullPath;
        console.log(`   📸 Captura del Menú Público guardada: ${publicScreenshotName}`);

        // Inspect public menu background image object-fit CSS
        const publicBgImg = publicPage.locator('div.fixed img').first();
        if (await publicBgImg.isVisible()) {
          const publicObjectFitCss = await publicBgImg.evaluate(el => window.getComputedStyle(el).objectFit);
          result.objectFitPublic = publicObjectFitCss;
          console.log(`   CSS object-fit en Menú Público: ${publicObjectFitCss}`);

          if (publicObjectFitCss !== 'fill') {
            result.status = 'FAIL';
            result.bugsFound.push({
              step: 'Menú Público object-fit CSS',
              expected: 'fill',
              observed: publicObjectFitCss,
              description: `En el menú público, el CSS objectFit rendered fue "${publicObjectFitCss}" en lugar de "fill".`
            });
          }
        }

        await publicContext.close();

      } catch (err: any) {
        result.status = 'FAIL';
        result.bugsFound.push({
          step: 'Ejecución general',
          expected: 'Prueba completada sin errores',
          observed: err.message,
          description: err.stack
        });
        console.error(`   ❌ Error en ${bp.label}:`, err.message);
      } finally {
        await adminContext.close();
        auditSummary.push(result);
      }
    });
  }

  test.afterAll(() => {
    console.log('\n========================================');
    console.log('📊 RESUMEN FINAL DE LA AUDITORÍA');
    console.log('========================================');
    console.table(auditSummary.map(r => ({
      Resolución: r.label,
      Estado: r.status,
      'Fit Editor': r.objectFitEditor,
      'Fit Público': r.objectFitPublic,
      Persistencia: r.persistedCorrectly ? 'SÍ' : 'NO',
      Bugs: r.bugsFound.length
    })));

    const jsonPath = path.join(artifactsDir, 'audit_results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(auditSummary, null, 2));
    console.log(`💾 Resultados guardados en ${jsonPath}`);
  });
});
