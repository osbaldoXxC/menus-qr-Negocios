import { test, expect } from '@playwright/test';
import { getResolvedBreakpointConfig, getBreakpointFromWidth, BREAKPOINTS_LIST } from '../src/utils/responsiveImageUtils';
import { getPublicMenuUrl } from '../src/utils/menuUtils';

test.describe('Pruebas E2E de Verificación de Correcciones', () => {

  test('1. Verificación de Menú Público: Header y Nav con fondo transparente', async ({ page }) => {
    // Navegar al menú público de prueba
    await page.goto('http://localhost:3000/menu/china-123');
    await page.waitForSelector('header');

    const headerBg = await page.evalOnSelector('header', (el) => window.getComputedStyle(el).backgroundColor);
    const navBg = await page.evalOnSelector('nav', (el) => window.getComputedStyle(el).backgroundColor);

    // Verificar que los fondos no sean opacos oscuros (transparentes / rgba(0, 0, 0, 0))
    expect(headerBg === 'rgba(0, 0, 0, 0)' || headerBg === 'transparent').toBeTruthy();
    expect(navBg === 'rgba(0, 0, 0, 0)' || navBg === 'transparent').toBeTruthy();
  });

  test('2. Verificación de Modal de Platillo: Sin textos de carrito/orden y botón Cerrar', async ({ page }) => {
    await page.goto('http://localhost:3000/menu/china-123');
    await page.waitForSelector('h3');

    // Abrir el primer platillo
    const firstDish = page.locator('h3').first();
    await firstDish.click();

    // Esperar al modal
    await page.waitForSelector('button:has-text("Cerrar")');

    const content = await page.content();
    expect(content).not.toContain('Agregar a la orden');
    expect(content).not.toContain('Personaliza tu pedido');

    // Verificar botón de cierre
    const closeBtn = page.locator('button', { hasText: 'Cerrar' });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
  });

  test('3. Verificación de Dashboard: Remoción de la métrica "Visitas este mes"', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Visitas este mes');
    expect(bodyText).not.toContain('1,284');
  });

  test('4. Verificación de URL con Variable de Entorno', () => {
    const url = getPublicMenuUrl('51ad632a-403d-426e-bfb4-2d32a448bb7b');
    expect(url).toContain('https://mexxican.mx/menu/51ad632a-403d-426e-bfb4-2d32a448bb7b');
  });

  test('5. Verificación de Configuración Responsiva por Breakpoints', () => {
    // Probar detección de breakpoints por ancho
    expect(getBreakpointFromWidth(1600)).toBe('desktop_large');
    expect(getBreakpointFromWidth(1400)).toBe('desktop');
    expect(getBreakpointFromWidth(1100)).toBe('laptop');
    expect(getBreakpointFromWidth(800)).toBe('tablet');
    expect(getBreakpointFromWidth(400)).toBe('mobile');
    expect(getBreakpointFromWidth(320)).toBe('mobile_small');

    // Probar resolución de herencia responsiva
    const mockMap = {
      mobile: {
        width: 400, height: 800, position_x: 10, position_y: 20, scale: 1.2,
        rotation: 5, object_fit: 'contain' as const, border_radius: 12, opacity: 90, z_index: 2, custom: true
      }
    };
    const resolved = getResolvedBreakpointConfig(mockMap, 'mobile');
    expect(resolved.config.width).toBe(400);
    expect(resolved.config.position_x).toBe(10);
    expect(resolved.config.scale).toBe(1.2);
    expect(resolved.config.custom).toBe(true);
  });
});
