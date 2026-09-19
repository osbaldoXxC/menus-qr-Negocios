# 📋 CHECKLIST & GUION DE DEMO EN VIVO — MEXXICANMX

---

## 🛠️ ANTES DE PRESENTAR (VERIFICACIÓN PREVIA EN EL AULA)

### 1. Lista de Chequeo Técnico (10 minutos antes)
- [ ] **Conexión a Internet:** Verificar acceso a internet en la laptop del expositor.
- [ ] **Verificación de URLs en Vivo:**
  - [ ] App Pública: `https://mexxicanmx.oamdevsol.site`
  - [ ] Cuestionario IA: `https://mexxicanmx.oamdevsol.site/cuestionario`
  - [ ] Admin Panel: `https://admin.oamdevsol.site`
- [ ] **Limpieza de Caché del Navegador:** Presionar `Ctrl + Shift + R` en Chrome/Edge antes de proyectar.
- [ ] **Pestañas Listas en el Navegador:**
  - **Pestaña 1:** Diapositivas de la Presentación (`presentacion_mexxicanmx.pptx`).
  - **Pestaña 2:** Cuestionario de IA (`https://mexxicanmx.oamdevsol.site/cuestionario`).
  - **Pestaña 3:** Panel de Administración (`https://admin.oamdevsol.site`).
  - **Pestaña 4:** Terminal de comandos (preparada con script de contingencia).

---

## 🎬 GUION EXACTO DE LA DEMO EN VIVO (PASO A PASO)

| Paso | Acción del Expositor | Qué Decir al Profesor | Qué Debe Aparecer en Pantalla |
| :--- | :--- | :--- | :--- |
| **1** | Cambiar a Pestaña 2 | *"Ahora vamos a realizar la demostración en vivo de la plataforma desplegada en la nube de AWS."* | Pantalla de inicio del Cuestionario IA (`/cuestionario`). |
| **2** | Escribir en el campo de texto: `Quiero tacos al pastor picositos` y hacer clic en `Continuar`. | *"Ingresamos un antojo en lenguaje cotidiano con errores o modismos cotidianos."* | Paso 2: Preferencias alimenticias. |
| **3** | Avanzar sin dieta especial y en Alergias seleccionar `Camarón`. | *"Demostraremos la regla de seguridad alimentaria: indicamos alergia al camarón."* | Paso 4: Ocasión social. |
| **4** | Seleccionar `Solo` y hacer clic en `Descubrir Recomendaciones`. | *"El sistema envía la solicitud en tiempo real al microservicio Python en AWS EC2."* | Pantalla de carga y posteriormente la Tarjeta de Recomendaciones. |
| **5** | Señalar el porcentaje de coincidencia y las razones de la tarjeta. | *"Como pueden observar, el motor asigna un 99% de match a Tacos al Pastor y garantiza que NO aparezca ningún platillo con camarón."* | Tarjeta interactiva con score 99%, tag de alérgenos seguros y razones. |
| **6** | Hacer clic en el botón ❤️ (Corazón). | *"Al hacer clic en me gusta, el sistema nos abre directamente el menú digital QR del restaurante en una pestaña independiente."* | Apertura inmediata de la carta digital interactiva del restaurante. |

---

## 🆘 PLAN B DE CONTINGENCIA (EN CASO DE FALLO DE INTERNET EN EL AULA)

Si la conexión a Internet en la universidad llega a fallar o ser inestable durante la exposición:

### Estrategia de Conmutación Local (Docker Local)
1. Abrir la terminal preparada y ejecutar el entorno local de Docker:
   ```bash
   docker compose up -d
   ```
2. Abrir el navegador en el entorno local de respaldo:
   - **Frontend Local:** `http://localhost:3000/cuestionario`
   - **Backend API Local:** `http://localhost:4000`
   - **ML Service Local:** `http://localhost:8000`

### Credenciales Demo de Respaldo:
- **Super Admin Email:** `baldo2005_@outlook.com`
- **Contraseña:** `Martinez24`

### Ejecución Instantánea de Pruebas Automatizadas (por si el profesor pide ver los tests en la terminal):
```bash
# 1. Ejecutar tests de ML en Python:
python -m unittest discover -s ml-service -p "test_engine.py"

# 2. Ejecutar suite E2E de Playwright:
npx playwright test e2e/recommendations.spec.ts
```
