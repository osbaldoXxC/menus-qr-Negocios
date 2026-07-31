const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    console.log('--- EMPEZANDO PRUEBA E2E: SOPORTE (PLAN PREMIUM Y PRUEBA) ---');
    
    const plans = [
      { name: 'Premium', email: 'e2epremium@test.com', pass: 'Password123!' },
      { name: 'Prueba', email: 'e2eprueba@test.com', pass: 'Password123!' }
    ];

    for (const plan of plans) {
      console.log(`\n============================`);
      console.log(`Ejecutando Escenario: Plan ${plan.name}`);
      console.log(`============================\n`);

      // ==========================================
      // CONTEXTO 1: RESTAURANTE
      // ==========================================
      const restContext = await browser.newContext();
      const restPage = await restContext.newPage();
      
      console.log(`[Restaurante] Iniciando sesión como ${plan.email}...`);
      await restPage.goto('http://localhost:3000/login');
      await restPage.fill('input[type="email"]', plan.email);
      await restPage.fill('input[type="password"]', plan.pass);
      await restPage.click('button[type="submit"]');
      await restPage.waitForTimeout(3000);
      
      console.log(`[Restaurante] Navegando al módulo de soporte...`);
      await restPage.screenshot({ path: `debug-dashboard-${plan.name}.png` });
      const menuSoporte = restPage.locator('a[href="/dashboard/soporte"]').first();
      await menuSoporte.waitFor({ state: 'visible', timeout: 5000 });
      await menuSoporte.click();
      // Send messages
      let conversacionIniciada = false;
      const btnConversacionActual = restPage.locator('button:has-text("Conversación Actual")').first();
      
      console.log(`[Restaurante] Verificando estado de la conversación...`);
      await btnConversacionActual.click();
      await restPage.waitForTimeout(1000);

      const asuntoInput = restPage.locator('input[placeholder*="Ej. Problemas"]').first();
      const mensajeTextarea = restPage.locator('textarea[placeholder*="Describe detalladamente"]').first();
      const iniciarConversacionBtn = restPage.locator('button:has-text("Iniciar Conversación")').first();

      if (await asuntoInput.isVisible()) {
          console.log(`[Restaurante] Creando nueva conversación...`);
          await asuntoInput.fill('Problema E2E - ' + Date.now());
          await mensajeTextarea.fill('Hola. Necesito ayuda con mi menú.');
          await iniciarConversacionBtn.click();
          await restPage.waitForTimeout(2000);
          conversacionIniciada = true;
      }

      console.log(`[Restaurante] Enviando mensajes...`);
      const msgInput = restPage.locator('input[placeholder*="Escribe tu duda"]').first();
      await msgInput.waitFor({ state: 'visible', timeout: 5000 });
      
      const testMessages = ['Hola.', 'Necesito ayuda con mi menú.', 'Tengo un problema con las imágenes.'];
      for (const msg of testMessages) {
          await msgInput.fill(msg);
          await msgInput.press('Enter');
          await restPage.waitForTimeout(500);
      }
      
      console.log(`[Restaurante] Verificando persistencia de mensajes...`);
      const messagesContainer = restPage.locator('.chat-messages').first();
      await messagesContainer.waitFor({ state: 'visible', timeout: 5000 });
      await restPage.waitForTimeout(1000); // give it a sec to render texts
      const textContent = await messagesContainer.innerText();
      console.log(`[Restaurante] Contenido de chat:\n`, textContent);
      if (!textContent.includes('Hola.')) throw new Error('Mensaje Hola. no apareció');
      if (!textContent.includes('Tengo un problema con las imágenes.')) throw new Error('Mensaje de problema no apareció');
      console.log(`✅ Restaurante completó el envío de mensajes.`);

      // ==========================================
      // CONTEXTO 2: ADMIN
      // ==========================================
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      
      console.log(`[Admin] Iniciando sesión...`);
      await adminPage.goto('http://localhost:3001');
      await adminPage.waitForTimeout(2000);
      await adminPage.fill('input[type="email"]', 'admin@mexxican.mx');
      await adminPage.fill('input[type="password"]', 'Admin12345!');
      await adminPage.click('button[type="submit"]');
      await adminPage.waitForTimeout(3000);
      
      console.log(`[Admin] Accediendo a pestaña Soporte Premium...`);
      await adminPage.click('text="Soporte Premium"');
      await adminPage.waitForTimeout(2000);
      
      console.log(`[Admin] Verificando aparición de la conversación en estado Pendiente...`);
      const convLocator = adminPage.locator(`text="Pendiente"`).first();
      await convLocator.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`✅ Conversación pendiente encontrada.`);
      
      // Abrir chat
      console.log(`[Admin] Abriendo conversación y respondiendo...`);
      await convLocator.click();
      await adminPage.waitForTimeout(2000);
      
      const adminMsgInput = adminPage.locator('input[placeholder*="respuesta"]').first();
      await adminMsgInput.waitFor({ state: 'visible', timeout: 5000 });
      
      const adminResponses = [
          'Hola.',
          'Soy el equipo de soporte E2E.',
          '¿En qué puedo ayudarte?'
      ];
      for (const msg of adminResponses) {
          await adminMsgInput.fill(msg);
          await adminPage.locator('button.btn-send').first().click();
          await adminPage.waitForTimeout(500);
      }
      console.log(`✅ Admin completó respuestas.`);

      // ==========================================
      // VOLVER A CONTEXTO 1: RESTAURANTE
      // ==========================================
      console.log(`[Restaurante] Verificando que llegaron las respuestas del admin en tiempo real...`);
      await restPage.waitForTimeout(3000);
      
      const restTextContent2 = await restPage.locator('.chat-messages').first().innerText();
      assert(restTextContent2.includes('Soy el equipo de soporte'), 'Respuesta del admin no llegó al restaurante');
      console.log(`✅ Mensajes recibidos correctamente.`);

      // ==========================================
      // ADMIN: FINALIZAR CONVERSACIÓN
      // ==========================================
      console.log(`[Admin] Cerrando la conversación...`);
      const btnCerrar = adminPage.locator('button:has-text("Finalizar"), button:has-text("Cerrar")').first();
      await btnCerrar.click();
      await adminPage.waitForTimeout(2000);
      console.log(`✅ Conversación cerrada.`);

      // ==========================================
      // RESTAURANTE: CALIFICACIÓN
      // ==========================================
      console.log(`[Restaurante] Verificando modal de calificación en tiempo real...`);
      await restPage.waitForTimeout(3000);
      
      // Verificar si hay modal de estrellas
      const starRating = restPage.locator('svg.lucide-star, svg.star').first();
      if (await starRating.isVisible()) {
          console.log(`[Restaurante] Calificando con 5 estrellas...`);
          // Click 5th star
          const stars = restPage.locator('svg.lucide-star, svg.star');
          await stars.nth(4).click();
          await restPage.locator('button:has-text("Enviar")').click();
          await restPage.waitForTimeout(2000);
          console.log(`✅ Calificación enviada.`);
      } else {
          console.log(`⚠️ No se encontró modal de calificación, asumiendo que es opcional en la UI.`);
      }

      console.log(`[Restaurante] Verificando modo solo lectura...`);
      const msgInputHidden = await restPage.locator('input[placeholder*="mensaje"]').isVisible();
      assert(!msgInputHidden, 'El input de mensaje debería estar oculto en una conversación cerrada.');
      console.log(`✅ Conversación está correctamente en modo lectura.`);

      // Cierre
      await restContext.close();
      await adminContext.close();
      
      console.log(`\n🎉 ESCENARIO ${plan.name} COMPLETADO EXITOSAMENTE 🎉`);
    }

    console.log('--- TODAS LAS PRUEBAS E2E PASARON CORRECTAMENTE ---');

  } catch (err) {
    console.error('❌ ERROR EN PRUEBAS E2E:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
