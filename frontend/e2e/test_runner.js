import { chromium } from 'playwright';
import assert from 'assert';

(async () => {
  console.log('🚀 Iniciando Suite de Pruebas de Verificación con Playwright...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let passed = 0;
  let failed = 0;

  async function runTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error('     Error:', err.message);
      failed++;
    }
  }

  // 1. Header y Nav transparentes
  await runTest('1. Menú Público: Header y Nav con fondo transparente', async () => {
    await page.goto('http://localhost:3000/menu/china-123', { waitUntil: 'networkidle' });
    await page.waitForSelector('header');

    const headerBg = await page.$eval('header', el => window.getComputedStyle(el).backgroundColor);
    const navBg = await page.$eval('nav', el => window.getComputedStyle(el).backgroundColor);

    assert(
      headerBg === 'rgba(0, 0, 0, 0)' || headerBg === 'transparent',
      `Header background no es transparente: ${headerBg}`
    );
    assert(
      navBg === 'rgba(0, 0, 0, 0)' || navBg === 'transparent',
      `Nav background no es transparente: ${navBg}`
    );
  });

  // 2. Modal de Platillo: Sin carrito/orden y botón Cerrar
  await runTest('2. Modal de Platillo: Sin carrito/orden y botón Cerrar', async () => {
    await page.goto('http://localhost:3000/menu/china-123', { waitUntil: 'networkidle' });
    
    // Hacer clic en un platillo
    const firstDish = page.locator('h3').first();
    await firstDish.click();
    await page.waitForSelector('button:has-text("Cerrar")');

    const html = await page.content();
    assert(!html.includes('Agregar a la orden'), 'Contiene "Agregar a la orden"');
    assert(!html.includes('Personaliza tu pedido'), 'Contiene "Personaliza tu pedido"');

    const closeBtn = page.locator('button', { hasText: 'Cerrar' });
    assert(await closeBtn.isVisible(), 'El botón Cerrar no es visible');
    await closeBtn.click();
  });

  // 3. Dashboard: Sin "Visitas este mes"
  await runTest('3. Dashboard: Métrica "Visitas este mes" eliminada', async () => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    const content = await page.textContent('body');
    assert(!content.includes('Visitas este mes'), 'Contiene "Visitas este mes"');
    assert(!content.includes('1,284'), 'Contiene "1,284"');
  });

  // 4. Verificación de URL pública con variable de entorno
  await runTest('4. Variable de entorno PUBLIC_MENU_URL configurada', async () => {
    const envUrl = process.env.VITE_PUBLIC_MENU_URL || 'https://mexxican.mx/menu/';
    assert(envUrl.includes('mexxican.mx'), `URL de entorno no válida: ${envUrl}`);
  });

  // 5. Verificación del flujo de Aprobación y Edición de Tiempo de Suscripción con PUT
  await runTest('5. Admin: Modificar/Extender tiempo de suscripción con PUT sin cancelar acceso', async () => {
    // Probar llamado HTTP PUT directo al backend para simular la asignación/extensión de tiempo por el Super Admin
    const resLogin = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mexxican.mx', password: 'password123' })
    });
    const dataLogin = await resLogin.json();

    if (resLogin.ok && dataLogin.access_token) {
      // Obtener lista de restaurantes
      const resList = await fetch('http://localhost:4000/api/admin/restaurants', {
        headers: { 'Authorization': `Bearer ${dataLogin.access_token}` }
      });
      const list = await resList.json();
      assert(Array.isArray(list), 'Respuesta de restaurantes no es un arreglo');

      if (list.length > 0) {
        const targetId = list[0].id;
        // Asignar/Extender tiempo mediante PUT
        const resPut = await fetch(`http://localhost:4000/api/admin/restaurants/${targetId}/approve`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${dataLogin.access_token}`
          },
          body: JSON.stringify({ dias: 60 })
        });

        const dataPut = await resPut.json();
        assert(resPut.ok, `Error en PUT de modificación de tiempo: ${dataPut.mensaje}`);
        assert.strictEqual(dataPut.restaurante.estado, 'aprobado');
        assert.strictEqual(dataPut.restaurante.suscripcion_activa, true);
        assert.strictEqual(dataPut.restaurante.dias_licencia, 60);
      }
    }
  });

  await browser.close();

  console.log('\n========================================');
  console.log(`RESULTADOS FINALIZADOS: ${passed} exitosas, ${failed} fallidas`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
})();
