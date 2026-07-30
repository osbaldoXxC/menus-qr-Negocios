import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TEST_CREDENTIALS = {
  email: 'a3523110279@alumno.uttehuacan.edu.mx',
  password: 'Martinez24'
};

// Public menu URL you provided
const PUBLIC_MENU_URL = 'http://localhost:3000/menu/51ad632a-403d-426e-bfb4-2d32a448bb7b';

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

test.describe('Complete Image Configuration Audit with Public Menu', () => {
  test.beforeAll(() => {
    ensureDirectories();
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 AUDITORÍA COMPLETA CON MENÚ PÚBLICO');
    console.log(`📍 Menú Público: ${PUBLIC_MENU_URL}`);
    console.log('═'.repeat(80) + '\n');
  });

  for (const bp of BREAKPOINTS) {
    test(`${bp.label}: configure fill and verify on public menu`, async ({ browser }) => {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`🎯 ${bp.label} (${bp.key})`);
      console.log(`${'─'.repeat(80)}\n`);

      const adminContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      const adminPage = await adminContext.newPage();

      let success = true;
      const errors: string[] = [];

      // Capture console logs and network requests
      adminPage.on('console', msg => {
        console.log(`   📝 [${msg.type()}] ${msg.text()}`);
      });

      let savedRequestBody: any = null;
      adminPage.on('request', request => {
        if (request.url().includes('/restaurants/theme')) {
          try {
            savedRequestBody = request.postDataJSON();
            console.log(`   📥 REQUEST to /restaurants/theme:`);
            console.log(`      Full body keys: ${Object.keys(savedRequestBody).join(', ')}`);
            console.log(`      config_diseno keys: ${Object.keys(savedRequestBody?.config_diseno || {}).join(', ')}`);
            console.log(`      apariencia keys: ${Object.keys(savedRequestBody?.config_diseno?.apariencia || {}).join(', ')}`);
            console.log(`      responsive_imagen: ${JSON.stringify(savedRequestBody?.config_diseno?.apariencia?.responsive_imagen)}`);
          } catch (e) {}
        }
      });

      try {
        // 1. Login
        console.log('1️⃣ Iniciando sesión...');
        await adminPage.goto('http://localhost:3000/login');
        await adminPage.waitForLoadState('networkidle');

        await adminPage.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
        await adminPage.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
        await adminPage.locator('button:has-text("Iniciar sesión")').click();

        try {
          await adminPage.waitForURL('**/dashboard/**', { timeout: 20000 });
        } catch {
          await adminPage.waitForURL('**/admin/**', { timeout: 20000 });
        }
        await adminPage.waitForTimeout(2000);
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
        console.log('   ✅ Configuración abierta\n');

        // 3. Open Dimensiones de Imagen
        console.log('3️⃣ Abriendo Dimensiones de Imagen...');
        let dimensionesBtn = adminPage.locator('button:has-text("Dimensiones de Imagen")').first();
        await dimensionesBtn.click();
        await adminPage.waitForTimeout(1200);
        console.log('   ✅ Editor abierto\n');

        // 4. Select breakpoint
        console.log(`4️⃣ Seleccionando ${bp.label}...`);
        const bpBtn = adminPage.locator(`button:has-text("${bp.label}")`).first();
        if (await bpBtn.isVisible()) {
          await bpBtn.click();
          await adminPage.waitForTimeout(800);
          console.log('   ✅ Seleccionado\n');
        } else {
          throw new Error(`Botón no encontrado: ${bp.label}`);
        }

        // 5. Set Object Fit to "fill"
        console.log('5️⃣ Configurando Object Fit a "fill"...');
        const objectFitSelect = adminPage.locator('select').first();
        const before = await objectFitSelect.inputValue();
        console.log(`   Antes: ${before}`);

        await objectFitSelect.selectOption('fill');
        const after = await objectFitSelect.inputValue();
        console.log(`   Después: ${after}`);

        if (after !== 'fill') {
          throw new Error(`No se configuró a 'fill', quedó en: ${after}`);
        }
        console.log('   ✅ Configurado\n');

        // 6. Screenshot del editor
        console.log('6️⃣ Capturando screenshot del editor...');
        const editorScreenshot = await takeScreenshot(adminPage, `EDITOR-${bp.key}`);
        console.log(`   ✅ Guardado: ${editorScreenshot}\n`);

        // 7. Save
        console.log('7️⃣ Guardando cambios...');
        const saveBtn = adminPage.locator('button:has-text("Guardar Cambios")').first();
        console.log(`   Save button visible: ${await saveBtn.isVisible()}`);
        console.log(`   Save button enabled: ${await saveBtn.isEnabled()}`);
        await saveBtn.click();
        await adminPage.waitForTimeout(2000);
        console.log('   ✅ Guardado\n');

        // 8. Open public menu with correct viewport
        console.log(`8️⃣ Abriendo menú público (viewport: ${bp.viewportWidth}x${bp.height})...`);
        const publicContext = await browser.newContext({
          viewport: { width: bp.viewportWidth, height: bp.height }
        });
        const publicPage = await publicContext.newPage();

        await publicPage.goto(PUBLIC_MENU_URL);
        await publicPage.waitForLoadState('networkidle');
        await publicPage.waitForTimeout(2000);
        console.log('   ✅ Menú público cargado\n');

        // 9. Screenshot del menú público
        console.log('9️⃣ Capturando screenshot del menú público...');
        const menuScreenshot = await takeScreenshot(publicPage, `MENU-${bp.key}`);
        console.log(`   ✅ Guardado: ${menuScreenshot}\n`);

        await publicContext.close();

        console.log(`✅ ${bp.label}: COMPLETADO\n`);

      } catch (error: any) {
        success = false;
        errors.push(error.message);
        console.log(`❌ ${bp.label}: ERROR - ${error.message}\n`);
      } finally {
        await adminContext.close();
      }

      // Assert test passed
      if (!success) {
        console.log(`Errores: ${errors.join(', ')}`);
        throw new Error(`Audit failed for ${bp.label}`);
      }
    });
  }

  test.afterAll(() => {
    console.log('\n' + '═'.repeat(80));
    console.log('✅ AUDITORÍA COMPLETADA');
    console.log(`📸 Screenshots guardados en: ${screenshotsDir}`);
    console.log('═'.repeat(80) + '\n');
  });
});
