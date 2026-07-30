import { test, expect, Page, BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ─── Configuration ───────────────────────────────────────────────────────────

const TEST_CREDENTIALS = {
  email: 'a3523110279@alumno.uttehuacan.edu.mx',
  password: 'Martinez24'
};

const PUBLIC_MENU_URL = 'http://localhost:3000/menu/51ad632a-403d-426e-bfb4-2d32a448bb7b';

const BREAKPOINTS = [
  { key: 'desktop_large', label: 'Desktop XL',     defaultW: 2560, defaultH: 1440, viewportW: 1920, viewportH: 1080, group: 'horizontal' },
  { key: 'desktop',       label: 'Desktop',        defaultW: 1920, defaultH: 1080, viewportW: 1366, viewportH: 900,  group: 'horizontal' },
  { key: 'laptop',        label: 'Laptop',         defaultW: 1366, defaultH: 768,  viewportW: 1200, viewportH: 800,  group: 'horizontal' },
  { key: 'tablet',        label: 'Tablet',         defaultW: 768,  defaultH: 1024, viewportW: 768,  viewportH: 1024, group: 'vertical'   },
  { key: 'mobile',        label: 'Móvil Standard', defaultW: 390,  defaultH: 844,  viewportW: 390,  viewportH: 844,  group: 'vertical'   },
  { key: 'mobile_small',  label: 'Móvil Pequeño',  defaultW: 320,  defaultH: 568,  viewportW: 320,  viewportH: 568,  group: 'vertical'   },
];

const reportsDir = 'audit-reports';
const screenshotsDir = path.join(reportsDir, 'screenshots');

// ─── Types ───────────────────────────────────────────────────────────────────

interface CSSProperties {
  width: string;
  height: string;
  objectFit: string;
  transform: string;
  borderRadius: string;
  opacity: string;
  zIndex: string;
}

interface BugReport {
  breakpoint: string;
  key?: string;
  step: string;
  expected: string;
  observed: string;
  cssProperty?: string;
  editorValue?: string;
  publicValue?: string;
  screenshotEditor?: string;
  screenshotPublic?: string;
  possibleCause: string;
  responsibleComponent: string;
  responsibleFile: string;
  solution: string;
}

interface BreakpointAuditResult {
  breakpoint: string;
  key: string;
  group: string;
  status: 'PASS' | 'FAIL';
  editorCSS: Partial<CSSProperties>;
  publicCSS: Partial<CSSProperties>;
  cssMatch: boolean;
  objectFitEditor: string;
  objectFitPublic: string;
  persistedCorrectly: boolean;
  uiShowsPersisted: boolean;
  editorScreenshot: string;
  publicScreenshot: string;
  notes: string[];
  bugs: BugReport[];
  editorSaveResponse?: any;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDirectories() {
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshot(page: Page, name: string): Promise<string> {
  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  return filename;
}

async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  await page.locator('button:has-text("Iniciar sesión")').click();
  try {
    await page.waitForURL('**/dashboard/**', { timeout: 20000 });
  } catch {
    await page.waitForURL('**/admin/**', { timeout: 20000 });
  }
  await page.waitForTimeout(1500);
}

async function navigateToConfiguracion(page: Page): Promise<void> {
  let configLink = page.locator('a:has-text("Configuración")').first();
  if (!(await configLink.isVisible())) {
    configLink = page.locator('button:has-text("Configuración")').first();
  }
  await configLink.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function openDimensionesEditor(page: Page): Promise<void> {
  const dimBtn = page.locator('button:has-text("Dimensiones de Imagen")').first();
  await expect(dimBtn).toBeVisible({ timeout: 10000 });
  await dimBtn.click();
  await page.waitForTimeout(1200);
}

async function selectBreakpoint(page: Page, label: string): Promise<void> {
  const bpBtn = page.locator(`button:has-text("${label}")`).first();
  await expect(bpBtn).toBeVisible({ timeout: 5000 });
  await bpBtn.click();
  await page.waitForTimeout(800);
}

async function getEditorCSS(page: Page): Promise<Partial<CSSProperties>> {
  const editorImg = page.locator('img[alt="Fondo interactivo"]').first();
  if (!(await editorImg.isVisible({ timeout: 2000 }).catch(() => false))) {
    return {};
  }
  return editorImg.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      width: s.width,
      height: s.height,
      objectFit: s.objectFit,
      transform: s.transform,
      borderRadius: s.borderRadius,
      opacity: s.opacity,
      zIndex: s.zIndex,
    };
  });
}

async function getPublicMenuCSS(page: Page): Promise<Partial<CSSProperties>> {
  const publicImg = page.locator('div.fixed img').first();
  if (!(await publicImg.isVisible({ timeout: 3000 }).catch(() => false))) {
    return {};
  }
  return publicImg.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      width: s.width,
      height: s.height,
      objectFit: s.objectFit,
      transform: s.transform,
      borderRadius: s.borderRadius,
      opacity: s.opacity,
      zIndex: s.zIndex,
    };
  });
}

function compareCSS(
  editor: Partial<CSSProperties>,
  public_: Partial<CSSProperties>,
  breakpoint: string
): { match: boolean; bugs: BugReport[] } {
  const bugs: BugReport[] = [];
  const propsToCompare: (keyof CSSProperties)[] = [
    'width', 'height', 'objectFit', 'transform', 'borderRadius', 'opacity', 'zIndex'
  ];

  for (const prop of propsToCompare) {
    const eVal = editor[prop];
    const pVal = public_[prop];
    if (eVal === undefined || pVal === undefined) {
      if (eVal === undefined && pVal !== undefined) {
        bugs.push({
          breakpoint,
          step: 'Editor-Public CSS comparison',
          expected: `${prop} defined in editor`,
          observed: `${prop} missing in editor but present in public menu: "${pVal}"`,
          cssProperty: prop,
          possibleCause: 'Editor canvas may not have rendered the image with the selected breakpoint config',
          responsibleComponent: 'ResponsiveImageEditor',
          responsibleFile: 'frontend/src/pages/Configuracion/ResponsiveImageEditor.tsx',
          solution: 'Ensure the editor canvas applies breakpoint config immediately when selected, and that the img[alt="Fondo interactivo"] element is rendered with the correct styles'
        });
      } else if (pVal === undefined && eVal !== undefined) {
        bugs.push({
          breakpoint,
          step: 'Editor-Public CSS comparison',
          expected: `${prop} present in both`,
          observed: `${prop} found in editor ("${eVal}") but public menu img not found or unstyled`,
          cssProperty: prop,
          possibleCause: 'Public menu may not render the same img element, or selector div.fixed img does not match',
          responsibleComponent: 'PublicMenu',
          responsibleFile: 'frontend/src/pages/PublicMenu/PublicMenu.tsx',
          solution: 'Verify that the public menu renders an img element inside div.fixed and that object-fit/transform styles from the responsive config are applied'
        });
      }
      continue;
    }
    if (eVal !== pVal) {
      bugs.push({
        breakpoint,
        step: 'Editor-Public CSS comparison',
        expected: `${prop}: "${eVal}" (editor)`,
        observed: `${prop}: "${pVal}" (public menu)`,
        cssProperty: prop,
        editorValue: eVal,
        publicValue: pVal,
        possibleCause: `Mismatch in ${prop} between editor canvas and public menu rendering — scaling or inheritance logic may differ`,
        responsibleComponent: prop === 'transform' ? 'Both (scaling logic)' : 'PublicMenu',
        responsibleFile: prop === 'transform'
          ? 'frontend/src/pages/Configuracion/ResponsiveImageEditor.tsx + frontend/src/pages/PublicMenu/PublicMenu.tsx'
          : 'frontend/src/pages/PublicMenu/PublicMenu.tsx',
        solution: prop === 'transform'
          ? 'Editor uses scaleFactor=min(containerW/defaultW, containerH/defaultH, 1); public uses viewportScale=windowWidth/defaultW. These will differ unless the container matches the viewport. Consider aligning the scaling approach.'
          : `Ensure public menu applies the same ${prop} value as the editor from the resolved breakpoint config`
      });
    }
  }

  return { match: bugs.length === 0, bugs };
}

function generateReport(allResults: BreakpointAuditResult[]): string {
  const passed = allResults.filter(r => r.status === 'PASS').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const totalBugs = allResults.reduce((sum, r) => sum + r.bugs.length, 0);

  let report = `# Auditoría Completa de Configuración de Imágenes\n\n`;
  report += `**Fecha:** ${new Date().toISOString()}\n`;
  report += `**Total Breakpoints:** ${allResults.length}\n`;
  report += `**✅ Pasaron:** ${passed}/${allResults.length}\n`;
  report += `**❌ Fallaron:** ${failed}/${allResults.length}\n`;
  report += `**🐛 Bugs encontrados:** ${totalBugs}\n\n`;

  report += `## Resumen Ejecutivo\n\n`;
  report += `| Breakpoint | Estado | ObjectFit Editor | ObjectFit Público | CSS Match | Persistencia | UI Persistida | Bugs |\n`;
  report += `|---|---|---|---|---|---|---|\n`;

  for (const r of allResults) {
    report += `| ${r.breakpoint} (${r.key}) | ${r.status === 'PASS' ? '✅ PASÓ' : '❌ FALLÓ'} | ${r.objectFitEditor || '-'} | ${r.objectFitPublic || '-'} | ${r.cssMatch ? '✅' : '❌'} | ${r.persistedCorrectly ? '✅' : '❌'} | ${r.uiShowsPersisted ? '✅' : '❌'} | ${r.bugs.length} |\n`;
  }

  report += `\n`;

  // ── Detail per breakpoint ──
  for (const r of allResults) {
    report += `## ${r.breakpoint} (${r.key})\n\n`;
    report += `**Estado:** ${r.status === 'PASS' ? '✅ PASÓ' : '❌ FALLÓ'}\n`;
    report += `**Grupo:** ${r.group}\n\n`;

    report += `### Capturas\n\n`;
    if (r.editorScreenshot) {
      report += `**Editor:**\n`;
      report += `![Editor Screenshot](screenshots/${r.editorScreenshot})\n\n`;
    }
    if (r.publicScreenshot) {
      report += `**Menú Público:**\n`;
      report += `![Public Menu Screenshot](screenshots/${r.publicScreenshot})\n\n`;
    }

    report += `### Propiedades CSS\n\n`;
    report += `| Propiedad | Editor | Menú Público | Coinciden? |\n`;
    report += `|---|---|---|---|\n`;

    const allProps: (keyof CSSProperties)[] = ['width', 'height', 'objectFit', 'transform', 'borderRadius', 'opacity', 'zIndex'];
    for (const prop of allProps) {
      const eVal = r.editorCSS[prop] || 'N/A';
      const pVal = r.publicCSS[prop] || 'N/A';
      const match = (r.editorCSS[prop] !== undefined && r.publicCSS[prop] !== undefined && eVal === pVal) ? '✅' : '❌';
      report += `| ${prop} | ${eVal} | ${pVal} | ${match} |\n`;
    }
    report += `\n`;

    report += `### Persistencia\n\n`;
    report += `- **object_fit guardado como "fill":** ${r.persistedCorrectly ? '✅ Sí' : '❌ No'}\n`;
    report += `- **UI refleja valor persistido:** ${r.uiShowsPersisted ? '✅ Sí' : '❌ No'}\n\n`;

    if (r.editorSaveResponse) {
      report += `**Respuesta del servidor al guardar:**\n\`\`\`json\n${JSON.stringify(r.editorSaveResponse, null, 2)}\n\`\`\`\n\n`;
    }

    if (r.notes.length > 0) {
      report += `### Notas\n\n`;
      for (const note of r.notes) {
        report += `- ${note}\n`;
      }
      report += `\n`;
    }

    if (r.bugs.length > 0) {
      report += `### Bugs Encontrados (${r.bugs.length})\n\n`;
      for (let i = 0; i < r.bugs.length; i++) {
        const b = r.bugs[i];
        report += `#### Bug #${i + 1}: ${b.step}\n\n`;
        report += `- **Breakpoint:** ${b.breakpoint}${b.key ? ` (${b.key})` : ''}\n`;
        report += `- **Paso:** ${b.step}\n`;
        if (b.cssProperty) report += `- **Propiedad CSS:** ${b.cssProperty}\n`;
        report += `- **Esperado:** ${b.expected}\n`;
        report += `- **Observado:** ${b.observed}\n`;
        if (b.editorValue) report += `- **Valor en Editor:** ${b.editorValue}\n`;
        if (b.publicValue) report += `- **Valor en Menú Público:** ${b.publicValue}\n`;
        if (b.screenshotEditor) report += `- **Captura Editor:** ![Editor](screenshots/${b.screenshotEditor})\n`;
        if (b.screenshotPublic) report += `- **Captura Menú Público:** ![Menu](screenshots/${b.screenshotPublic})\n`;
        report += `- **Causa Posible:** ${b.possibleCause}\n`;
        report += `- **Componente Responsable:** ${b.responsibleComponent}\n`;
        report += `- **Archivo:** ${b.responsibleFile}\n`;
        report += `- **Solución Propuesta:** ${b.solution}\n\n`;
      }
    }

    report += `---\n\n`;
  }

  // ── Recommendations ──
  report += `## Recomendaciones Generales\n\n`;

  const hasTransformMismatch = allResults.some(r =>
    r.bugs.some(b => b.cssProperty === 'transform')
  );
  const hasObjectFitMismatch = allResults.some(r =>
    r.bugs.some(b => b.cssProperty === 'objectFit')
  );
  const hasPersistenceFailure = allResults.some(r => !r.persistedCorrectly);

  if (hasTransformMismatch) {
    report += `1. **Diferencia en transform/scale entre Editor y Menú Público:** El editor usa \`scaleFactor = min(containerW/defaultW, containerH/defaultH, 1)\` mientras que el menú público usa \`viewportScale = windowWidth / defaultW\`. Evaluar si deben unificarse para lograr una representación 1:1.\n\n`;
  }
  if (hasObjectFitMismatch) {
    report += `2. **Discrepancia en object-fit:** Verificar que el menú público aplique correctamente el valor \`object_fit\` desde el breakpoint config resuelto. Revisar el flujo de datos desde \`responsive_imagen\` en \`config_diseno.apariencia\` hasta la renderización del \`<img>\` en \`PublicMenu.tsx\`.\n\n`;
  }
  if (hasPersistenceFailure) {
    report += `3. **Fallo de persistencia:** Verificar que el endpoint \`PUT /restaurants/theme\` recibe y guarda correctamente el campo \`responsive_imagen\`. Revisar el middleware de validación en el backend y la lógica de parseo en \`restauranteService.updateTheme()\`.\n\n`;
  }
  report += `4. **Herencia entre breakpoints:** Verificar que la herencia separada por grupos (Horizontal → desktop_large > desktop > laptop, Vertical → tablet > mobile > mobile_small) funciona correctamente y que un breakpoint inferior hereda solo si el superior tiene \`custom: true\`.\n\n`;

  const reportPath = path.join(reportsDir, 'FINAL_AUDIT_REPORT.md');
  fs.writeFileSync(reportPath, report);
  return reportPath;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const allResults: BreakpointAuditResult[] = [];

test.describe('Auditoría Definitiva de Configuración de Imágenes', () => {
  test.beforeAll(() => {
    ensureDirectories();
    console.log('\n' + '█'.repeat(80));
    console.log(' AUDITORÍA DEFINITIVA - CONFIGURACIÓN DE IMÁGENES RESPONSIVAS');
    console.log(' Menú Público: ' + PUBLIC_MENU_URL);
    console.log(' Breakpoints: ' + BREAKPOINTS.map(b => b.label).join(', '));
    console.log('█'.repeat(80) + '\n');
  });

  for (const bp of BREAKPOINTS) {
    test(`Auditar ${bp.label} (${bp.key})`, async ({ browser }) => {
      console.log(`\n${'═'.repeat(80)}`);
      console.log(` INICIANDO AUDITORÍA: ${bp.label} (${bp.key})`);
      console.log(` Viewport admin: 1920x1080 | Viewport público: ${bp.viewportW}x${bp.viewportH}`);
      console.log(` Grupo: ${bp.group}`);
      console.log(`${'═'.repeat(80)}\n`);

      const result: BreakpointAuditResult = {
        breakpoint: bp.label,
        key: bp.key,
        group: bp.group,
        status: 'PASS',
        editorCSS: {},
        publicCSS: {},
        cssMatch: true,
        objectFitEditor: '',
        objectFitPublic: '',
        persistedCorrectly: false,
        uiShowsPersisted: false,
        editorScreenshot: '',
        publicScreenshot: '',
        notes: [],
        bugs: [],
      };

      // ── Create admin context (wide viewport for editor) ──
      const adminContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'es-MX',
      });
      const adminPage = await adminContext.newPage();

      // Intercept API calls for debugging
      adminPage.on('response', async (response) => {
        if (response.url().includes('/restaurants/theme')) {
          try {
            const json = await response.json();
            result.editorSaveResponse = json;
          } catch {}
        }
      });

      try {
        // ── 1. Login ──
        console.log('[PASO 1/10] Iniciando sesión...');
        await login(adminPage);
        console.log('       ✅ Sesión iniciada\n');

        // ── 2. Navigate to Configuración ──
        console.log('[PASO 2/10] Navegando a Configuración...');
        await navigateToConfiguracion(adminPage);
        console.log('       ✅ En Configuración\n');

        // ── 3. Open Dimensiones de Imagen ──
        console.log('[PASO 3/10] Abriendo editor Dimensiones de Imagen...');
        await openDimensionesEditor(adminPage);
        console.log('       ✅ Editor abierto\n');

        // ── 4. Select the breakpoint ──
        console.log(`[PASO 4/10] Seleccionando breakpoint "${bp.label}"...`);
        await selectBreakpoint(adminPage, bp.label);
        console.log('       ✅ Breakpoint seleccionado\n');

        // ── 5. Set object-fit to "fill" ──
        console.log('[PASO 5/10] Configurando Acomodo de Imagen → Estirar (Fill)...');
        const objectFitSelect = adminPage.locator('select[data-testid="object-fit-select"]').first();
        await expect(objectFitSelect).toBeVisible({ timeout: 5000 });
        const beforeVal = await objectFitSelect.inputValue();
        console.log(`       Valor anterior: "${beforeVal}"`);

        await objectFitSelect.selectOption('fill');
        await adminPage.waitForTimeout(300);
        const afterVal = await objectFitSelect.inputValue();
        result.objectFitEditor = afterVal;
        console.log(`       Valor después: "${afterVal}"`);

        if (afterVal !== 'fill') {
          result.status = 'FAIL';
          result.bugs.push({
            breakpoint: bp.label,
            step: 'Configurar object-fit = fill en editor',
            expected: 'fill',
            observed: afterVal,
            cssProperty: 'objectFit',
            editorValue: afterVal,
            possibleCause: 'El selector no aceptó el valor "fill" o el onChange no actualizó el estado',
            responsibleComponent: 'ResponsiveImageEditor',
            responsibleFile: 'frontend/src/pages/Configuracion/ResponsiveImageEditor.tsx',
            solution: 'Verificar que selectOption("fill") dispare el onChange correctamente y actualice currentConfig.object_fit'
          });
        }
        console.log('       ✅ Object-fit configurado\n');

        // ── 6. Capture editor screenshot + CSS ──
        console.log('[PASO 6/10] Capturando editor screenshot y CSS...');
        await adminPage.evaluate(() => window.scrollTo(0, 0));
        await adminPage.waitForTimeout(500);

        // Get CSS before screenshot
        result.editorCSS = await getEditorCSS(adminPage);
        console.log(`       CSS object-fit en editor: "${result.editorCSS.objectFit || 'N/A'}"`);
        console.log(`       CSS transform en editor: "${result.editorCSS.transform || 'N/A'}"`);

        result.editorScreenshot = await takeScreenshot(adminPage, `EDITOR-${bp.key}`);
        console.log(`       ✅ Screenshot guardado: ${result.editorScreenshot}\n`);

        // ── 7. Save configuration ──
        console.log('[PASO 7/10] Guardando configuración...');
        const saveBtn = adminPage.locator('button[data-testid="save-responsive-config"]').first();
        const saveBtnFallback = adminPage.locator('button:has-text("Guardar Cambios")').first();

        let saveClicked = false;
        if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveBtn.click();
          saveClicked = true;
        } else if (await saveBtnFallback.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveBtnFallback.click();
          saveClicked = true;
        } else {
          result.notes.push('No se encontró botón de guardar — puede que el auto-save ya haya ocurrido');
        }

        if (saveClicked) {
          await adminPage.waitForLoadState('networkidle');
          await adminPage.waitForTimeout(2000);
          console.log('       ✅ Guardado completado\n');
        } else {
          console.log('       ⚠️  No se hizo clic en guardar (auto-save?)\n');
        }

        // ── 8. Verify persistence: reload + check UI ──
        console.log('[PASO 8/10] Verificando persistencia (recargar + verificar UI)...');
        await adminPage.reload();
        await adminPage.waitForLoadState('networkidle');
        await adminPage.waitForTimeout(1500);

        // Re-navigate
        await navigateToConfiguracion(adminPage);
        await openDimensionesEditor(adminPage);
        await selectBreakpoint(adminPage, bp.label);

        const selectAfterReload = adminPage.locator('select[data-testid="object-fit-select"]').first();
        const reloadVal = await selectAfterReload.inputValue();
        console.log(`       Object-fit tras recargar: "${reloadVal}"`);

        if (reloadVal === 'fill') {
          result.persistedCorrectly = true;
          result.uiShowsPersisted = true;
          console.log('       ✅ Persistencia correcta — UI refleja "fill"\n');
        } else {
          result.persistedCorrectly = false;
          result.uiShowsPersisted = false;
          result.status = 'FAIL';
          result.bugs.push({
            breakpoint: bp.label,
            step: 'Persistencia tras recargar página',
            expected: 'fill',
            observed: reloadVal,
            cssProperty: 'objectFit',
            editorValue: reloadVal,
            possibleCause: 'El estado no se guardó en el servidor, o al recargar se pierde porque no se persiste correctamente en la BD',
            responsibleComponent: 'Configuracion (onSave callback) + restauranteService.updateTheme()',
            responsibleFile: 'frontend/src/pages/Configuracion/Configuracion.tsx + frontend/src/services/restaurante.ts',
            solution: 'Verificar que onSave en Configuracion.tsx envíe el responsive_imagen completo y que updateTheme() lo procese correctamente'
          });
          console.log(`       ❌ Persistencia falló — se obtuvo "${reloadVal}"\n`);
        }

        // ── 9. Also verify via direct API call ──
        console.log('[PASO 9/10] Verificando persistencia en servidor vía API directa...');
        try {
          const apiCheck = await adminPage.evaluate(() =>
            fetch('http://localhost:4000/api/restaurants/info').then(r => r.json())
          );
          const bpConfig = apiCheck?.config_diseno?.apariencia?.responsive_imagen?.[bp.key];
          if (bpConfig) {
            console.log(`       Config en servidor para ${bp.key}: object_fit="${bpConfig.object_fit}", custom=${bpConfig.custom}`);
            if (bpConfig.object_fit === 'fill') {
              result.persistedCorrectly = true;
              console.log('       ✅ Servidor confirma object_fit=fill\n');
            } else {
              console.log(`       ⚠️  Servidor tiene object_fit="${bpConfig.object_fit}"\n`);
            }
          } else {
            console.log('       ⚠️  No hay config para este breakpoint en el servidor\n');
          }
        } catch (e: any) {
          console.log(`       ⚠️  No se pudo verificar vía API: ${e.message}\n`);
        }

        await adminContext.close();

        // ── 10. Open public menu with breakpoint viewport ──
        console.log(`[PASO 10/10] Abriendo menú público con viewport ${bp.viewportW}x${bp.viewportH}...`);
        const publicContext = await browser.newContext({
          viewport: { width: bp.viewportW, height: bp.viewportH },
          locale: 'es-MX',
        });
        const publicPage = await publicContext.newPage();

        await publicPage.goto(PUBLIC_MENU_URL);
        await publicPage.waitForLoadState('networkidle');
        await publicPage.waitForTimeout(2000);

        // Get CSS from public menu
        result.publicCSS = await getPublicMenuCSS(publicPage);
        result.objectFitPublic = result.publicCSS.objectFit || '';
        console.log(`       CSS object-fit en público: "${result.publicCSS.objectFit || 'N/A'}"`);
        console.log(`       CSS transform en público: "${result.publicCSS.transform || 'N/A'}"`);

        // Screenshot del menú público
        result.publicScreenshot = await takeScreenshot(publicPage, `MENU-${bp.key}`);
        console.log(`       ✅ Screenshot guardado: ${result.publicScreenshot}`);

        // Compare CSS between editor and public menu
        const { match, bugs } = compareCSS(result.editorCSS, result.publicCSS, bp.label);
        result.cssMatch = match;
        result.bugs.push(...bugs);

        if (!match) {
          result.status = 'FAIL';
          console.log(`       ❌ Discrepancias CSS encontradas: ${bugs.length}`);
          for (const b of bugs) {
            console.log(`          - ${b.cssProperty}: esperado="${b.expected}", observado="${b.observed}"`);
          }
        } else {
          console.log('       ✅ CSS coincide entre editor y menú público');
        }

        await publicContext.close();

        // ── Final status ──
        if (result.status === 'PASS') {
          console.log(`\n✅ ${bp.label}: AUDITORÍA COMPLETA - PASÓ\n`);
        } else {
          console.log(`\n❌ ${bp.label}: AUDITORÍA COMPLETA - FALLÓ (${result.bugs.length} bug(s))\n`);
        }

      } catch (error: any) {
        result.status = 'FAIL';
        result.bugs.push({
          breakpoint: bp.label,
          step: 'Ejecución general del test',
          expected: 'Completar todos los pasos sin error',
          observed: error.message,
          possibleCause: error.stack || error.message,
          responsibleComponent: 'Test runner',
          responsibleFile: 'frontend/e2e/final-image-audit.spec.ts',
          solution: 'Revisar el log de ejecución y corregir el error específico'
        });
        console.error(`\n❌ ERROR en ${bp.label}: ${error.message}\n`);
      }

      allResults.push(result);
    });
  }

  test.afterAll(() => {
    console.log('\n' + '█'.repeat(80));
    console.log(' GENERANDO REPORTE FINAL DE AUDITORÍA');
    console.log('█'.repeat(80) + '\n');

    // Compact log
    console.log('📋 RESUMEN:\n');
    for (const r of allResults) {
      const icon = r.status === 'PASS' ? '✅' : '❌';
      console.log(` ${icon} ${r.breakpoint} (${r.key}) — ${r.bugs.length} bugs`);
      if (r.bugs.length > 0) {
        for (const b of r.bugs) {
          console.log(`    └─ ${b.cssProperty ? `[${b.cssProperty}] ` : ''}${b.step}: ${b.observed.substring(0, 120)}`);
        }
      }
    }

    const passed = allResults.filter(r => r.status === 'PASS').length;
    const failed = allResults.filter(r => r.status === 'FAIL').length;
    const totalBugs = allResults.reduce((s, r) => s + r.bugs.length, 0);

    console.log(`\n${'═'.repeat(40)}`);
    console.log(` Total: ${allResults.length} breakpoints`);
    console.log(` ✅ Pasaron: ${passed}`);
    console.log(` ❌ Fallaron: ${failed}`);
    console.log(` 🐛 Bugs totales: ${totalBugs}`);
    console.log(`${'═'.repeat(40)}\n`);

    const reportPath = generateReport(allResults);
    console.log(`📄 Reporte generado: ${reportPath}\n`);

    // JSON export for machine processing
    const jsonPath = path.join(reportsDir, 'audit-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2));
    console.log(`💾 Datos exportados: ${jsonPath}\n`);

    if (failed === 0) {
      console.log('✅ TODAS LAS AUDITORÍAS PASARON — Representación 1:1 entre editor y menú público');
    } else {
      console.log(`⚠️  ${failed} auditoría(s) detectaron discrepancias — revisar el reporte para detalles`);
    }
    console.log('█'.repeat(80) + '\n');
  });
});
