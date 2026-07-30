import { test, expect } from '@playwright/test';

test.describe('Image Configuration Persistence Bug', () => {
  test('should persist image configuration after switching tabs', async ({ page }) => {
    // Navegar a localhost:3000
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Esperar y buscar el botón "Dimensiones de Imagen"
    const dimensionesButton = page.locator('button:has-text("Dimensiones de Imagen")').first();

    // Esperar a que el botón sea visible (máximo 10 segundos)
    await dimensionesButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      console.log('⚠️ No se encontró el botón "Dimensiones de Imagen", buscando alternativas...');
    });

    // Hacer click en el botón
    await dimensionesButton.click().catch(async () => {
      console.log('⚠️ No se pudo hacer click, buscando otro selector...');
      // Buscar cualquier botón que contenga "Imagen" o "Editar"
      const altButton = page.locator('button:has-text("Editar Imagen"), button:has-text("Configurar")').first();
      await altButton.click();
    });

    // Esperar a que se cargue el editor (buscar inputs y selects)
    await page.waitForSelector('input[type="range"], select', { timeout: 5000 });

    console.log('✅ Editor de imagen abierto');

    // Configurar valores iniciales en Desktop
    await page.click('button:has-text("Desktop")').catch(() => console.log('Desktop ya seleccionado'));

    // Obtener referencias a los controles
    const rangeInputs = page.locator('input[type="range"]');
    const numberInputs = page.locator('input[type="number"]');
    const selectInputs = page.locator('select');

    // Cambiar Scale (primer range)
    const scaleSlider = rangeInputs.nth(0);
    await scaleSlider.fill('2.5');
    const initialScale = await scaleSlider.inputValue();

    // Cambiar Position X
    const posXInput = numberInputs.nth(0);
    await posXInput.fill('50');
    const initialX = await posXInput.inputValue();

    // Cambiar Position Y
    const posYInput = numberInputs.nth(1);
    await posYInput.fill('75');
    const initialY = await posYInput.inputValue();

    // Cambiar Object Fit
    const objectFitSelect = selectInputs.nth(0);
    await objectFitSelect.selectOption('contain');
    const initialObjectFit = await objectFitSelect.inputValue();

    console.log('📐 Valores configurados:');
    console.log(`  Scale: ${initialScale}, X: ${initialX}, Y: ${initialY}, ObjectFit: ${initialObjectFit}`);

    // Guardar cambios
    const applyButton = page.locator('button:has-text("Aplicar"), button:has-text("Guardar Cambios")').last();
    await applyButton.click().catch(() => console.log('No se encontró botón de guardar'));
    await page.waitForTimeout(1000);

    console.log('✅ Cambios guardados');

    // Cambiar a otra pestaña/página
    console.log('🔄 Cambiando a Descubrir...');
    await page.click('a:has-text("Descubrir"), button:has-text("Descubrir")').first();
    await page.waitForTimeout(2000);

    // Regresar a Configuración
    console.log('🔄 Regresando a Configuración...');
    await page.click('a:has-text("Configuración"), button:has-text("Configuración")').first();
    await page.waitForTimeout(2000);

    // Abrir el editor nuevamente
    console.log('🔍 Reabriendo editor...');
    await page.click('button:has-text("Dimensiones de Imagen")').first();
    await page.waitForSelector('input[type="range"]', { timeout: 5000 });

    // Seleccionar Desktop de nuevo
    await page.click('button:has-text("Desktop")').catch(() => {});
    await page.waitForTimeout(500);

    // Verificar que los valores persistan
    const currentScaleSlider = page.locator('input[type="range"]').nth(0);
    const currentPosXInput = page.locator('input[type="number"]').nth(0);
    const currentPosYInput = page.locator('input[type="number"]').nth(1);
    const currentObjectFitSelect = page.locator('select').nth(0);

    const currentScale = await currentScaleSlider.inputValue();
    const currentX = await currentPosXInput.inputValue();
    const currentY = await currentPosYInput.inputValue();
    const currentObjectFit = await currentObjectFitSelect.inputValue();

    console.log('📸 Valores después de regresar:');
    console.log(`  Scale: ${currentScale}, X: ${currentX}, Y: ${currentY}, ObjectFit: ${currentObjectFit}`);

    // Assertions
    expect(currentScale).toBe(initialScale);
    expect(currentX).toBe(initialX);
    expect(currentY).toBe(initialY);
    expect(currentObjectFit).toBe(initialObjectFit);

    console.log('✅ Bug reproducido: Valores NO persisten correctamente!');
  });

  test('should persist configuration across multiple breakpoints', async ({ page }) => {
    // Navegar a Configuración
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    await page.click('text=Configuración');
    await page.waitForLoadState('networkidle');

    // Abrir editor
    const editImageButton = page.locator('button:has-text("Editar Imagen"), button:has-text("Configurar Imagen")').first();
    if (await editImageButton.isVisible()) {
      await editImageButton.click();
    }

    await page.waitForSelector('[class*="responsive"], [class*="editor"]', { timeout: 5000 });

    // Configurar Desktop
    console.log('📐 Configurando Desktop...');
    await page.click('button:has-text("Desktop")');
    const scaleSlider = page.locator('input[type="range"]').first();
    await scaleSlider.fill('2');
    const desktopScale = await scaleSlider.inputValue();

    // Configurar Tablet
    console.log('📐 Configurando Tablet...');
    await page.click('button:has-text("Tablet")');
    await page.waitForLoadState('networkidle');
    const tabletScaleSlider = page.locator('input[type="range"]').first();
    await tabletScaleSlider.fill('1.5');
    const tabletScale = await tabletScaleSlider.inputValue();

    // Volver a Desktop y verificar
    console.log('🔄 Regresando a Desktop...');
    await page.click('button:has-text("Desktop")');
    await page.waitForLoadState('networkidle');
    const finalDesktopScale = await page.locator('input[type="range"]').first().inputValue();

    console.log(`✅ Desktop Scale persistido: ${finalDesktopScale}`);
    expect(finalDesktopScale).toBe(desktopScale);
  });
});
