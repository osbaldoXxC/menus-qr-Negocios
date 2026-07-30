==============================================================================

FRAMEWORK ENTERPRISE DE AUDITORÍA ARQUITECTÓNICA DE SOFTWARE

ARCHIVO: 02-phase-frontend.yml

FASE 2: VALIDACIÓN RIGUROSA Y DETALLADA DEL FRONTEND Y MOTOR DE RENDERIZADO

==============================================================================

version: "2.0.0"
phase: "02-FRONTEND-VALIDATION"
description: >
Fase 2 del Framework de Auditoría para MexxicanMX. Despliega un ejército de 18
subagentes especializados para validar que el Frontend, el Dashboard de Restaurante,
el Editor de Configuración, el Panel Super Admin y el Menú Público operen con
un 100% de consistencia, aislamiento de componentes, fidelidad responsive y
paridad absoluta en el motor de renderizado.

metadata:
target_system: "MexxicanMX / menus-qr-Negocios"
auditor_engine: "UI Render Engine Auditor & Multi-Agent Matrix"
execution_mode: "Strict-Non-Destructive-Validation"
strictness_level: "MAXIMUM"
required_phase_prerequisite: "01-phase-discovery"
prerequisite_artifacts:
- "phase01-output.json"
- "AUDITORIA-ARQUITECTURA-MexxicanMX.md"

==============================================================================

1. MASTER AGENT & ORQUESTACIÓN GENERAL

==============================================================================

master_agent:
id: "FRONTEND-MASTER-AGENT-02"
name: "Master Auditor of Frontend & Rendering Architecture"
role: >
Orquestador principal responsable de validar la integridad de la entrada,
cargar el contexto de la Fase 1, instanciar los 18 subagentes especializados,
consolidar hallazgos, verificar criterios de bloqueo y autorizar el avance a la Fase 3.
responsibilities:
- "Verificar la existencia e integridad inmutable de los artefactos de la Fase 1."
- "Detectar cambios en el código fuente mediante hash SHA-256 respecto al inventario de Fase 1."
- "Coordinar la ejecución distribuida de los 18 subagentes."
- "Abortar el flujo si se detecta cualquier discrepancia entre el Simulator Preview y el Menú Público."
- "Generar los 12 artefactos JSON requeridos de la Fase 2."

execution_pipeline:
step_01_verify_prerequisites:
action: "ASSERT_PREREQUISITES"
targets:
- "artifacts/phase01-output.json"
- "AUDITORIA-ARQUITECTURA-MexxicanMX.md"
on_fail: "ABORT_AND_REQUEST_PHASE_01_RERUN"

step_02_load_context:
  action: "LOAD_PROJECT_CONTEXT"
  inputs:
    master_index: "phase01-output.json#.master_index"
    component_inventory: "phase01-output.json#.inventory"
    dependency_map: "phase01-output.json#.dependencies"
    architecture: "AUDITORIA-ARQUITECTURA-MexxicanMX.md"

step_03_integrity_drift_check:
  action: "VERIFY_FILE_HASHES"
  description: "Asegurar que ningún archivo listado en la Fase 1 haya sido alterado."
  on_drift_detected: "MARK_PHASE_01_OUTDATED_AND_HALT"

step_04_dispatch_sub_agents:
  action: "LAUNCH_SUB_AGENTS"
  concurrency: 6
  agent_list:
    - "dashboard_agent"
    - "public_menu_agent"
    - "preview_engine_agent"
    - "responsive_engine_agent"
    - "configuration_engine_agent"
    - "component_isolation_agent"
    - "theme_engine_agent"
    - "css_conflict_agent"
    - "layout_engine_agent"
    - "rendering_agent"
    - "image_engine_agent"
    - "typography_agent"
    - "animation_agent"
    - "accessibility_agent"
    - "state_flow_agent"
    - "event_flow_agent"
    - "visual_regression_agent"
    - "ui_render_engine_auditor"

step_05_consolidate_results:
  action: "AGGREGATE_METRICS_AND_BLOCKERS"

step_06_evaluate_gate:
  action: "EVALUATE_UNLOCK_CRITERIA"
  on_pass: "GENERATE_ARTIFACTS_AND_UNLOCK_PHASE_03"
  on_fail: "EMIT_BLOCKER_REPORT_AND_HALT"


==============================================================================

2. CONTEXT LOADER

==============================================================================

context_loader:
id: "CONTEXT-LOADER-02"
description: "Carga la memoria técnica de MexxicanMX sin re-escaneo destructivo."
data_sources:
frontend_public_apps:
path: "frontend/src/"
entry_point: "main.tsx"
router: "App.tsx"
super_admin_app:
path: "admin/src/"
entry_point: "main.tsx"
god_component: "App.tsx"
known_god_components:
- "frontend/src/pages/PublicMenu/PublicMenu.tsx"
- "admin/src/App.tsx"
known_dead_code:
- "frontend/src/pages/Home/"
- "frontend/src/pages/Discovery/"
theme_config_storage:
table: "configuracion_tema"
field: "config_diseno"
data_type: "TEXT (JSON Serialized)"
image_responsive_util:
path: "frontend/src/utils/responsiveImageUtils.ts"
breakpoints: ["mobile_small", "mobile", "tablet", "laptop", "desktop", "desktop_large"]

==============================================================================

3. REGLAS GLOBALES Y BLOQUEOS DE CERO TOLERANCIA

==============================================================================

global_rules:
zero_tolerance_blockers:
- id: "ZTB-001"
name: "Discrepancia entre Preview y Menú Público"
rule: "Preview_DOM_and_Styles MUST BE IDENTICAL TO PublicMenu_DOM_and_Styles"
severity: "CRITICAL"
- id: "ZTB-002"
name: "Interferencia Responsive entre Resoluciones"
rule: "Changes in Resolution_A MUST NOT mutate layout/styles in Resolution_B"
severity: "CRITICAL"
- id: "ZTB-003"
name: "Elementos Invisibles en Cambio de Tema"
rule: "Switching Light/Dark theme MUST NOT produce invisible text or illegible contrast"
severity: "CRITICAL"
- id: "ZTB-004"
name: "Estilos Globales Contaminantes"
rule: "Global CSS rules (*, body, img, h1, button, p, span, div) MUST NOT corrupt internal components"
severity: "CRITICAL"
- id: "ZTB-005"
name: "Mutación de Estado sin Contrato"
rule: "Components MUST NOT mutate another component's internal state directly"
severity: "CRITICAL"
- id: "ZTB-006"
name: "Render Loops / Re-renders Infinitos"
rule: "No state change cycle shall cause infinite component re-renders"
severity: "CRITICAL"
- id: "ZTB-007"
name: "Falta de Encapsulamiento de Componentes"
rule: "Component styling MUST be scoped or strictly structured via utility classes"
severity: "CRITICAL"
- id: "ZTB-008"
name: "Divergencia en Árbol de Renderizado"
rule: "Dashboard Preview Tree MUST match Public Menu Render Tree 100%"
severity: "CRITICAL"

==============================================================================

4. ARQUITECTURA DETALLADA DE SUBAGENTES (18 SUBAGENTES)

==============================================================================

sub_agents:

----------------------------------------------------------------------------

AGENTE 1: Dashboard Agent

----------------------------------------------------------------------------

id: "dashboard_agent"
name: "Dashboard & Admin UI Auditor"
target_paths:

"frontend/src/pages/DashboardRestaurante/"

"frontend/src/pages/MiMenu/"

"frontend/src/pages/NuevoPlatillo/"

"frontend/src/pages/CodigoQR/"

"frontend/src/pages/components/Sidebar.tsx"

"frontend/src/pages/components/Header.tsx"

"frontend/src/pages/components/Navbar.tsx"

"admin/src/App.tsx"
tasks:

"Inspeccionar aislamiento de layout del Dashboard del restaurante."

"Audit del God Component admin/App.tsx (600+ líneas, CSS de 1600+ líneas)."

"Validar Sidebar, Header, Navbar, Widgets, Paneles y composición Responsive."

"Verificar llamadas de endpoints desde el Admin (detectar inconsistencia /approve vs /status)."
assertions:

"Dashboard layout renders without horizontal overflow across all viewports."

"Super Admin App handles authentication state independently without crashing."

----------------------------------------------------------------------------

AGENTE 2: Public Menu Agent

----------------------------------------------------------------------------

id: "public_menu_agent"
name: "Public Menu Architecture Auditor"
target_paths:

"frontend/src/pages/PublicMenu/PublicMenu.tsx"

"frontend/src/services/comensal.ts"
tasks:

"Auditar el God Component PublicMenu.tsx (709+ líneas)."

"Verificar desensamblado de responsabilidades: fetch, calculo de breakpoints, renderizado de fondos, categorias, platillos."

"Identificar datos fallback desactualizados (MENU_DUMMY, CHINA_MENU_DUMMY, GOURMET_MENU_DUMMY) embebidos en el componente."

"Validar que la desactivación de transform: scale() no deje código muerto ni variables huérfanas (scalingFactor, baseWidth)."
assertions:

"PublicMenu correctly handles missing mock data gracefully."

"Data fetched via comensalService.getMenuByQR accurately feeds the render tree."

----------------------------------------------------------------------------

AGENTE 3: Preview Engine Agent

----------------------------------------------------------------------------

id: "preview_engine_agent"
name: "Preview Engine Parity Auditor"
target_paths:

"frontend/src/pages/Configuracion/"

"frontend/src/pages/PublicMenu/PublicMenu.tsx"
tasks:

"Comparar el motor de renderizado del Simulador/Editor de Configuración con el Menú Público."

"Ejecutar validación de paridad de DOM y CSS."
assertions:

"CRITICAL: Does Preview use EXACTLY the same renderer as Public Menu? If NO -> ERROR CRITICAL (ZTB-001)."

----------------------------------------------------------------------------

AGENTE 4: Responsive Engine Agent

----------------------------------------------------------------------------

id: "responsive_engine_agent"
name: "Multi-Resolution & Breakpoint Auditor"
target_paths:

"frontend/src/utils/responsiveImageUtils.ts"

"frontend/src/index.css"

"admin/src/App.css"
resolutions_to_test:

320

340

360

375

390

412

430

480

600

768

820

1024

1200

1366

1440

1600

1920
breakpoints_defined:

"mobile_small"

"mobile"

"tablet"

"laptop"

"desktop"

"desktop_large"
tasks:

"Validar comportamiento layout e imágenes en las 17 resoluciones explícitas."

"Comprobar la herencia de configuración en responsiveImageUtils.ts cuando un breakpoint no tiene valores asignados."

"Asegurar independencia de configuraciones por resolución."
assertions:

"Zero layout breaks across all 17 target resolutions."

"No breakpoint modification overrides neighbor resolution settings."

----------------------------------------------------------------------------

AGENTE 5: Configuration Engine Agent

----------------------------------------------------------------------------

id: "configuration_engine_agent"
name: "Configuration Flow & State Persistence Auditor"
target_paths:

"frontend/src/pages/Configuracion/"

"frontend/src/services/restaurante.ts"
tasks:

"Reconstruir y auditar el flujo completo de configuración end-to-end:"
flow: "User Moves Slider -> React State -> Context -> Store -> Preview -> API (PUT /restaurants/theme) -> Backend -> PostgreSQL (config_diseno TEXT) -> Response -> Updated Preview"

"Demostrar que NO existe pérdida de información durante la serialización/deserialización del JSON config_diseno."
assertions:

"All layout parameters (colors, fonts, layout_type, background) survive full round-trip serialization."

----------------------------------------------------------------------------

AGENTE 6: Component Isolation Agent

----------------------------------------------------------------------------

id: "component_isolation_agent"
name: "Component Encapsulation & Interferences Auditor"
target_paths:

"frontend/src/pages/components/"
tasks:

"Evaluar contaminación entre componentes."

"Revisar filtración de estilos CSS, fugas en Context API, Providers, Store, Props y Handlers de eventos."

"Responder: ¿Existe algún componente que modifique el estado o estilos de otro componente sin un contrato explícito?"
assertions:

"Component scope is 100% strictly enforced."

----------------------------------------------------------------------------

AGENTE 7: Theme Engine Agent

----------------------------------------------------------------------------

id: "theme_engine_agent"
name: "Color Dynamics & Theme Auditor"
target_paths:

"frontend/src/context/ThemeContext.tsx"

"frontend/src/pages/PublicMenu/PublicMenu.tsx"
tasks:

"Auditar comportamiento de Modo Claro (Light) y Modo Oscuro (Dark)."

"Validar el algoritmo isColorDark() aplicado sobre color_fondo."

"Detectar anomalías visuales: textos invisibles, colores quemados (hardcoded), iconos ilegibles, sombras desproporcionadas, scrollbars, estados focus, hover, disabled y active."
assertions:

"Text contrast ratio complies with WCAG AA minimums (4.5:1) in both light and dark backgrounds."

----------------------------------------------------------------------------

AGENTE 8: CSS Conflict Agent

----------------------------------------------------------------------------

id: "css_conflict_agent"
name: "Global Styles & CSS Pollution Auditor"
target_paths:

"frontend/src/index.css"

"admin/src/App.css"
tasks:

"Escanear hojas de estilo en busca de selectores globales nocivos:"
prohibited_globals: ["*", "body", "img", "button", "input", "div", "span", "h1", "p"]

"Identificar reglas que sobrescriban componentes internos sin CSS Scoping o Tailwind Reset."
assertions:

"Zero leaking global styles impacting isolated UI components."

----------------------------------------------------------------------------

AGENTE 9: Layout Engine Agent

----------------------------------------------------------------------------

id: "layout_engine_agent"
name: "Layout Tree Hierarchy Auditor"
target_paths:

"frontend/src/pages/PublicMenu/"

"frontend/src/pages/components/MainLayout.tsx"
tasks:

"Reconstruir la jerarquía visual:"
hierarchy: "Menu -> Section -> Container -> Category -> Product -> Card -> Image -> Typography"

"Validar que cada nodo controle estrictamente su propio contenedor y box-model."
assertions:

"Each component limits layout management strictly to its own DOM children."

----------------------------------------------------------------------------

AGENTE 10: Rendering Agent

----------------------------------------------------------------------------

id: "rendering_agent"
name: "Shared Render Engine Auditor"
target_paths:

"frontend/src/pages/DashboardRestaurante/"

"frontend/src/pages/Configuracion/"

"frontend/src/pages/PublicMenu/PublicMenu.tsx"
tasks:

"Construir matriz de renderizado:"
pipeline: "Dashboard -> Preview -> Renderer -> Public Menu"

"Verificar que utilicen el mismo árbol de componentes React, exactamente las mismas props, la misma estructura CSS y la misma lógica de cálculo."
assertions:

"100% parity between Editor Preview Tree and Public Menu Render Tree."

----------------------------------------------------------------------------

AGENTE 11: Image Engine Agent

----------------------------------------------------------------------------

id: "image_engine_agent"
name: "Asset & Image Processing Auditor"
target_paths:

"frontend/src/utils/responsiveImageUtils.ts"

"backend/src/middleware/uploadMiddleware.js"
tasks:

"Auditar pipeline de imágenes: object-fit, object-position, recortado (crop), lazy loading, resolución responsive y compresión WebP."

"Verificar mitigaciones de carga y fallbacks en caso de URL rota de AWS S3 o servidor local."
assertions:

"All rendered images feature mandatory lazy-loading and explicit aspect ratios to avoid layout shifts (CLS)."

----------------------------------------------------------------------------

AGENTE 12: Typography Agent

----------------------------------------------------------------------------

id: "typography_agent"
name: "Typography System Auditor"
target_paths:

"frontend/src/index.css"

"admin/src/App.css"
tasks:

"Auditar familias tipográficas (Outfit, Inter, System UI), escala de tamaños, peso font-weight, line-height, letter-spacing y adaptabilidad responsive."
assertions:

"Typography scales predictably without overlapping or breaking line clamps."

----------------------------------------------------------------------------

AGENTE 13: Animation Agent

----------------------------------------------------------------------------

id: "animation_agent"
name: "Motion & Transition Auditor"
target_paths:

"frontend/src/pages/"
tasks:

"Auditar uso de framer-motion v10.16.4."

"Revisar transiciones de página (0.2s fade), transformaciones (transform), opacidad (opacity), duración y curvas de aceleración (easing)."

"Asegurar que las animaciones no provoquen re-renders masivos ni caídas de FPS (<60fps)."
assertions:

"Animations do not cause frame drops or layout jitter on lower-end devices."

----------------------------------------------------------------------------

AGENTE 14: Accessibility Agent

----------------------------------------------------------------------------

id: "accessibility_agent"
name: "a11y Standards Auditor"
target_paths:

"frontend/src/"

"admin/src/"
tasks:

"Verificar atributos ARIA (aria-expanded, aria-label, role), labels en formularios, navegación completa por teclado, trampa de foco (focus traps) y niveles de contraste."
assertions:

"All interactive controls (buttons, inputs, sliders) are reachable and operable via Keyboard navigation."

----------------------------------------------------------------------------

AGENTE 15: State Flow Agent

----------------------------------------------------------------------------

id: "state_flow_agent"
name: "State Propagation & Storage Auditor"
target_paths:

"frontend/src/services/"

"frontend/src/App.tsx"
tasks:

"Reconstruir el flujo de estado:"
flow: "Input -> Hook -> Context -> Store -> API -> Response"

"Evaluar el uso actual de localStorage para tokens de autenticación y la falta de un estado global reactivo (Redux/Zustand)."
assertions:

"Token expiration handles state cleanup without leaving invalid application state."

----------------------------------------------------------------------------

AGENTE 16: Event Flow Agent

----------------------------------------------------------------------------

id: "event_flow_agent"
name: "UI Event Lifecycle Auditor"
target_paths:

"frontend/src/"
tasks:

"Reconstruir el ciclo de eventos:"
flow: "Click -> Handler -> State Update -> Component Render -> Preview Sync -> Persistence API"

"Verificar que los eventos de la UI no sean silenciados por bloqueos try/catch vacíos o mock data que enmascare fallos de red."
assertions:

"All user interactions trigger predictable state transitions without uncaught errors."

----------------------------------------------------------------------------

AGENTE 17: Visual Regression Agent

----------------------------------------------------------------------------

id: "visual_regression_agent"
name: "DOM & Visual Delta Auditor"
target_paths:

"frontend/src/pages/Configuracion/"

"frontend/src/pages/PublicMenu/"
tasks:

"Efectuar comparación pixel/DOM entre la vista previa del simulador ('Antes') y la vista real del comensal ('Después')."

"Detectar desplazamientos de elementos, descuadres de padding/margin y variaciones de renderizado."
assertions:

"Visual delta between Editor Preview and Public Menu equals 0.00%."

----------------------------------------------------------------------------

AGENTE 18: UI Render Engine Auditor (AGENTE PRINCIPAL)

----------------------------------------------------------------------------

id: "ui_render_engine_auditor"
name: "Lead UI Render Engine Auditor"
role: "Agente Principal de la Fase 2"
target_paths:

"frontend/src/"

"admin/src/"
tasks:

"Consolidar las evaluaciones de los 17 subagentes previos."

"Ejecutar la prueba definitiva de certificación:"
mission: >
Demostrar de forma irrefutable que el Dashboard, el Simulador de Configuración
y el Menú Público utilizan exactamente el mismo motor de renderizado y que
cualquier configuración realizada en el editor se refleja sin diferencias en
el resultado final.
assertions:

"Unified rendering engine architecture is 100% verified and compliant."

==============================================================================

5. VALIDACIONES OBLIGATORIAS Y ENTREGABLES ARTEFACTOS

==============================================================================

mandatory_validations:
phase_halt_conditions:
- "El Preview difiere visualmente o estructuralmente del Menú Público."
- "Una configuración para una resolución altera el layout de otra resolución."
- "El modo oscuro oculta textos o elimina el contraste de lectura."
- "Existe un selector global CSS que altera los estilos encapsulados."
- "Un componente modifica directamente el estado de otro sin interfaz clara."
- "Se detectan bucles de renderizado o re-renders innecesarios en cascada."
- "Componentes visuales carecen de aislamiento o scoping."
- "Existen diferencias en el árbol de render del Dashboard y el Menú Público."

required_artifacts:
output_directory: "./artifacts/phase02/"
files:
- name: "frontend-component-tree.json"
description: "Estructura completa y jerárquica de todos los componentes React."
- name: "frontend-layout-map.json"
description: "Mapa de layouts, wrappers y contenedores principales."
- name: "responsive-map.json"
description: "Matriz de comportamiento para los 6 breakpoints y 17 resoluciones."
- name: "theme-map.json"
description: "Mapa de variables de color, modo claro, modo oscuro y algoritmo contrast-ratio."
- name: "render-tree.json"
description: "Árbol de renderizado unificado (Dashboard vs Preview vs Menú Público)."
- name: "preview-vs-public.json"
description: "Informe de comparativa de paridad DOM/CSS entre Simulador y Menú Público."
- name: "component-interference.json"
description: "Matriz de acoplamiento e interferencia entre componentes."
- name: "css-conflicts.json"
description: "Listado de selectores CSS globales y reglas en conflicto."
- name: "configuration-flow.json"
description: "Rastreo de flujo de estado end-to-end desde el Editor hasta la BD."
- name: "state-flow.json"
description: "Diagrama de propagación de estado y uso de Storage/Context."
- name: "event-flow.json"
description: "Mapeo de eventos de usuario, handlers y ciclo de re-renderizado."
- name: "frontend-score.json"
description: "Puntuación cuantitativa final y desglose de métricas del Frontend."

==============================================================================

6. CRITERIOS DE ACEPTACIÓN Y DESBLOQUEO DE FASE 3

==============================================================================

unlock_criteria_phase_03:
metrics:
frontend_coverage: 100.0  # Cobertura total de archivos del Frontend
components_inspected: 100.0 # Porcentaje de componentes auditados
layouts_inspected: 100.0 # Porcentaje de layouts auditados
breakpoints_validated: 100.0 # Cobertura de las 17 resoluciones
preview_public_parity: 100.0 # Coincidencia visual y estructural entre Preview y Menú
resolution_isolation: 100.0 # Validado
theme_integrity: 100.0 # Cero textos invisibles o contrastes rotos
phase_confidence_score: 98.0 # Nivel de confianza mínimo para avanzar
critical_errors_count: 0 # Tolerancia CERO a errores críticos

master_agent_authorization:
action: "UNLOCK_PHASE_03_BACKEND_AND_DATABASE"
condition: "ALL_CRITERIA_MET == true"
on_success: "Log SUCCESS and create flag file 'phase02.completed'"
on_failure: "Halt process, emit 'phase02-blockers.md' and reject transition."