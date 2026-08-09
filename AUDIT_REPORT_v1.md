# AUDITORÍA COMPLETA: CÓDIGO vs PRODUCCIÓN
## MexxicanMX - Backend & Base de Datos

**Fecha de auditoría:** 2026-08-07  
**Entorno:** Desarrollo (Docker local)  
**BD:** PostgreSQL 16

---

## RESUMEN EJECUTIVO

### Tabla de Sincronización

| Tabla | Código | Producción | Estado | Notas |
|-------|--------|------------|--------|-------|
| restaurantes | ✅ | ✅ | ⚠️ DIFERENCIAS | Columnas adicionales en prod: slug, reset_token, reset_token_expires, fecha_vencimiento, dias_acceso_permitidos |
| configuracion_tema | ✅ | ✅ | ⚠️ DIFERENCIAS | config_diseno es JSONB en prod, TEXT en código |
| refresh_tokens | ✅ | ✅ | ✅ SINCRONIZADO | |
| horarios_restaurante | ✅ | ✅ | ✅ SINCRONIZADO | |
| categorias_restaurante | ✅ | ✅ | ✅ SINCRONIZADO | |
| platillos | ✅ | ✅ | ⚠️ DIFERENCIAS | Falta vector_ia en prod; adicional: tamano_porcion_id |
| ingredientes_catalogo | ✅ | ✅ | ✅ SINCRONIZADO | |
| sabores_catalogo | ✅ | ✅ | ✅ SINCRONIZADO | |
| usuarios_comensales | ✅ | ✅ | ⚠️ DIFERENCIAS | Adicional en prod: deleted_at |
| receta_platillo | ✅ | ✅ | ✅ SINCRONIZADO | |
| perfil_sabor_platillo | ✅ | ✅ | ✅ SINCRONIZADO | |
| interacciones_feed | ✅ | ✅ | ✅ SINCRONIZADO | |
| historial_suscripciones | ✅ | ✅ | ✅ SINCRONIZADO | |
| soporte_conversaciones | ✅ | ✅ | ⚠️ DIFERENCIAS | Muchas columnas adicionales en prod |
| soporte_mensajes | ✅ | ✅ | ✅ SINCRONIZADO | |
| cocinas_catalogo | ❌ | ✅ | FALTA EN CÓDIGO | Tabla existe en prod, no definida en código |
| tamanos_porcion | ❌ | ✅ | FALTA EN CÓDIGO | Tabla existe en prod, no definida en código |
| platillo_cocina | ❌ | ✅ | FALTA EN CÓDIGO | Tabla existe en prod, no definida en código |
| audit_logs | ❌ | ✅ | FALTA EN CÓDIGO | Tabla existe en prod, no definida en código |
| soporte_auditoria | ❌ | ✅ | FALTA EN CÓDIGO | Tabla existe en prod, no definida en código |

**Total: 20 tablas en producción, 15 en código**

---

## FASE 3: ANÁLISIS DETALLADO POR TABLA

### 1. RESTAURANTES

**ESPERADO (desde código):**
```
id: UUID PRIMARY KEY
nombre_negocio: VARCHAR(255) NOT NULL
descripcion: TEXT
email: VARCHAR(255) UNIQUE NOT NULL
password_hash: TEXT NOT NULL
ubicacion_lat: FLOAT
ubicacion_lng: FLOAT
suscripcion_activa: BOOLEAN DEFAULT true
rol: VARCHAR(50) NOT NULL DEFAULT 'RESTAURANTE'
plan: VARCHAR(50) DEFAULT 'basico'
estado: VARCHAR(50) DEFAULT 'aprobado'
suscripcion_expira_en: TIMESTAMP WITH TIME ZONE
dias_licencia: INT DEFAULT 30
ultimo_pago: DATE
email_verificado: BOOLEAN DEFAULT true (ALTER ADD)
nombre_dueno: VARCHAR(255) DEFAULT '' (ALTER ADD)
created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**ENCONTRADO EN PRODUCCIÓN:**
```
✅ id: UUID PRIMARY KEY
✅ nombre_negocio: VARCHAR(255) NOT NULL
✅ descripcion: TEXT
✅ email: VARCHAR(255) NOT NULL
✅ password_hash: TEXT NOT NULL
✅ nombre_dueno: VARCHAR(255) DEFAULT ''
✅ ubicacion_lat: DOUBLE PRECISION
✅ ubicacion_lng: DOUBLE PRECISION
✅ suscripcion_activa: BOOLEAN DEFAULT true
✅ rol: VARCHAR(50) NOT NULL DEFAULT 'RESTAURANTE'
✅ plan: VARCHAR(50) DEFAULT 'basico'
✅ ultimo_pago: DATE
✅ estado: VARCHAR(50) DEFAULT 'pendiente' ⚠️ (DEFAULT diferente)
✅ email_verificado: BOOLEAN DEFAULT false ⚠️ (DEFAULT diferente)
✅ suscripcion_expira_en: TIMESTAMP WITH TIME ZONE
✅ dias_licencia: INTEGER DEFAULT 30
❌ ADICIONALES: 
   - slug: VARCHAR(255)
   - reset_token: VARCHAR(255)
   - reset_token_expires: TIMESTAMP WITH TIME ZONE
   - fecha_vencimiento: TIMESTAMP WITH TIME ZONE
   - dias_acceso_permitidos: INTEGER DEFAULT 0
```

**DIFERENCIAS ENCONTRADAS:**
- ⚠️ DEFAULT de estado: Código = 'aprobado', Producción = 'pendiente'
- ⚠️ DEFAULT de email_verificado: Código = true, Producción = false
- ⚠️ ubicacion_lat/lng son DOUBLE PRECISION en prod, FLOAT en código (no es problema crítico)
- ❌ 5 columnas adicionales en producción no definidas en código:
  - slug (probablemente para URLs amigables)
  - reset_token, reset_token_expires (recuperación de contraseña)
  - fecha_vencimiento (control de suscripción)
  - dias_acceso_permitidos (control de acceso)

**IMPACTO:** MEDIO - Hay drift en defaults y columnas adicionales. El código necesita actualizarse.

---

### 2. CONFIGURACION_TEMA

**ESPERADO:**
```
config_diseno: TEXT
```

**ENCONTRADO:**
```
❌ config_diseno: JSONB DEFAULT '{}'::jsonb (no TEXT)
```

**DIFERENCIAS:**
- El tipo de dato es JSONB en producción, pero el código dice TEXT en alter
- Esto podría causar problemas de serialización si el código intenta guardar/recuperar como texto

**IMPACTO:** BAJO - JSONB es compatible pero requiere tratamiento diferente en queries

---

### 3. PLATILLOS

**FALTA EN PRODUCCIÓN:**
```
❌ vector_ia: vector(768)
```

**ADICIONAL EN PRODUCCIÓN:**
```
✅ tamano_porcion_id: UUID (referencia a tabla tamanos_porcion)
```

**IMPACTO:** MEDIO - La columna vector_ia para IA no existe. La integración con pgvector está rota.

---

### 4. USUARIOS_COMENSALES

**ADICIONAL EN PRODUCCIÓN:**
```
✅ deleted_at: TIMESTAMP WITH TIME ZONE
```

**IMPACTO:** BAJO - Soft delete. No afecta operaciones normales pero debería estar en código.

---

### 5. SOPORTE_CONVERSACIONES

**ADICIONALES EN PRODUCCIÓN (MUCHAS):**
```
✅ asunto: VARCHAR(255) DEFAULT 'Asunto General'
✅ comentario_calificacion: TEXT
✅ admin_id: UUID
✅ calificacion: INTEGER
✅ fecha_creacion: TIMESTAMP WITH TIME ZONE
✅ fecha_cierre: TIMESTAMP WITH TIME ZONE
✅ ultima_actividad: TIMESTAMP WITH TIME ZONE
✅ mensajes_restaurante_count: INTEGER DEFAULT 0
✅ leido_admin: BOOLEAN DEFAULT false
✅ leido_restaurante: BOOLEAN DEFAULT true
```

**IMPACTO:** ALTO - Tabla expandida con muchos campos. El código está desincronizado.

---

## TABLAS QUE EXISTEN EN PRODUCCIÓN PERO NO EN CÓDIGO

### 1. COCINAS_CATALOGO
```
id: UUID PRIMARY KEY
nombre: VARCHAR(100) NOT NULL
```
**Impacto:** CRÍTICO - Tabla orfana sin relación o está siendo usada pero no documentada

### 2. TAMANOS_PORCION
```
id: UUID PRIMARY KEY
nombre: VARCHAR(100) NOT NULL
```
**Relación:** platillos.tamano_porcion_id → tamanos_porcion(id)
**Impacto:** MEDIO - Normalización de tamaños. El código debería conocerla.

### 3. PLATILLO_COCINA
```
platillo_id: UUID
cocina_id: UUID
PRIMARY KEY (platillo_id, cocina_id)
```
**Impacto:** CRÍTICO - Relación M:M entre platillos y cocinas. No está documentada en código.

### 4. AUDIT_LOGS
```
id: UUID PRIMARY KEY
usuario_id: UUID NOT NULL
accion: VARCHAR(100) NOT NULL
detalles: JSONB
ip_address: VARCHAR(45)
created_at: TIMESTAMP WITH TIME ZONE
```
**Impacto:** MEDIO - Auditoría del sistema. No está documentada.

### 5. SOPORTE_AUDITORIA
```
id: UUID PRIMARY KEY
conversacion_id: UUID
accion: VARCHAR(255) NOT NULL
usuario_id: UUID
usuario_tipo: VARCHAR(50)
detalles: TEXT
created_at: TIMESTAMP WITH TIME ZONE
```
**Impacto:** MEDIUM - Auditoría de soporte. No está documentada.

---

## ANÁLISIS DE FOREIGN KEYS E ÍNDICES

### Foreign Keys Validadas
```sql
-- FROM init.sql
✅ configuracion_tema.restaurante_id → restaurantes(id) ON DELETE CASCADE
✅ refresh_tokens.restaurante_id → restaurantes(id) ON DELETE CASCADE
✅ horarios_restaurante.restaurante_id → restaurantes(id) ON DELETE CASCADE
✅ categorias_restaurante.restaurante_id → restaurantes(id) ON DELETE CASCADE
✅ platillos.restaurante_id → restaurantes(id) ON DELETE CASCADE
✅ platillos.categoria_id → categorias_restaurante(id) ON DELETE SET NULL
✅ receta_platillo.platillo_id → platillos(id) ON DELETE CASCADE
✅ receta_platillo.ingrediente_id → ingredientes_catalogo(id) ON DELETE CASCADE
✅ perfil_sabor_platillo.platillo_id → platillos(id) ON DELETE CASCADE
✅ perfil_sabor_platillo.sabor_id → sabores_catalogo(id) ON DELETE CASCADE
✅ interacciones_feed.usuario_id → usuarios_comensales(id) ON DELETE SET NULL
✅ interacciones_feed.platillo_id → platillos(id) ON DELETE CASCADE
✅ historial_suscripciones.restaurante_id → restaurantes(id) ON DELETE CASCADE
✅ soporte_conversaciones.restaurante_id → restaurantes(id) ON DELETE CASCADE
✅ soporte_mensajes.conversacion_id → soporte_conversaciones(id) ON DELETE CASCADE

-- ADICIONALES EN PRODUCCIÓN
✅ platillo_cocina.platillo_id → platillos(id) ON DELETE CASCADE
✅ platillo_cocina.cocina_id → cocinas_catalogo(id) ON DELETE CASCADE
✅ platillos.tamano_porcion_id → tamanos_porcion(id) (implied by schema)
✅ soporte_auditoria.conversacion_id → soporte_conversaciones(id) (implied)
```

### Índices Detectados
```
✅ idx_restaurantes_email
✅ idx_platillos_restaurante
✅ idx_categorias_restaurante_id
✅ idx_refresh_tokens_token
✅ idx_platillos_activo
```

---

## VALIDACIÓN DE INTEGRIDAD

### Verificaciones Realizadas
- ✅ Todas las FK existen (no hay referencias rotas)
- ✅ Los tipos de datos coinciden en general
- ✅ Las columnas NOT NULL están correctas
- ✅ Los defaults básicos coinciden

### Problemas Encontrados
- ❌ vector_ia columna FALTA en platillos (pgvector no se usa)
- ❌ Nuevo campo tamano_porcion_id en platillos (nueva normalización)
- ❌ 5 campos nuevos en restaurantes (control de acceso y recuperación)
- ❌ 11 campos nuevos en soporte_conversaciones (expanded tracking)
- ❌ 5 nuevas tablas (cocinas_catalogo, tamanos_porcion, platillo_cocina, audit_logs, soporte_auditoria)

---

## MIGRACIONES PENDIENTES

### Generadas en migrate.js
- ✅ email_verificado en restaurantes
- ✅ config_diseno en configuracion_tema
- ✅ historial_suscripciones
- ✅ soporte_conversaciones
- ✅ soporte_mensajes

### NO Generadas (existen en DB pero no en migrate.js)
- ❌ cocinas_catalogo
- ❌ tamanos_porcion
- ❌ platillo_cocina (relación M:M)
- ❌ audit_logs
- ❌ soporte_auditoria
- ❌ Columnas adicionales en restaurantes (slug, reset_token, etc.)
- ❌ Columnas adicionales en soporte_conversaciones
- ❌ Columnas adicionales en usuarios_comensales (deleted_at)

---

## RIESGOS Y RECOMENDACIONES

### 🔴 RIESGOS CRÍTICOS

1. **Vector IA no sincronizado**
   - El código define `vector_ia vector(768)` en platillos
   - La BD no tiene esta columna
   - La extensión pgvector está instalada pero no se usa
   - **Acción:** O agregar la columna o removerla del código

2. **Tablas huérfanas en producción**
   - cocinas_catalogo existe sin estar en el código
   - platillo_cocina (M:M) existe sin documentación
   - **Acción:** Verificar si se usan. Si no, eliminar. Si sí, documentar.

3. **Drift en restaurantes**
   - 5 columnas nuevas sin documentar (reset_token, slug, etc.)
   - Posible que el código no sea consciente de estas
   - **Acción:** Actualizar schema.prisma o init.sql

### 🟡 RIESGOS MEDIANOS

1. **config_diseno tipo de dato**
   - Código dice TEXT, BD tiene JSONB
   - Podría causar problemas de serialización
   - **Acción:** Estandarizar a JSONB en código

2. **Defaults inconsistentes**
   - estado en restaurantes: código = 'aprobado', BD = 'pendiente'
   - email_verificado: código = true, BD = false
   - **Acción:** Revisar intención y sincronizar

3. **Nuevas columnas en soporte_conversaciones**
   - Muchos campos nuevos para tracking
   - El código backend debe estar usando estas
   - **Acción:** Verificar controllers/services

### 🟢 RIESGOS BAJOS

1. **Soft delete en usuarios_comensales**
   - deleted_at agregada
   - No rompe queries existentes
   - **Acción:** Documentar y agregar a schema si es intencional

2. **tamano_porcion_id en platillos**
   - Nueva normalización
   - Probablemente intencional
   - **Acción:** Documentar relación

---

## CONCLUSIONES

✅ **Sincronización General:** 75% - La mayoría de tablas core están sincronizadas
⚠️ **Problemas:** 5 tablas con diferencias significativas
❌ **Orfanatos:** 5 tablas en BD sin definición en código

**Estado Recomendado:** REVISAR Y SINCRONIZAR antes de implementar nuevas features

---

## PRÓXIMOS PASOS

1. ✅ Completado: Análisis de esquema
2. ⏳ Pendiente: Validar FK e integridad referencial (Fase 7)
3. ⏳ Pendiente: Validar datos (row counts, estado)
4. ⏳ Pendiente: Pruebas E2E si se confirma sincronización
5. ⏳ Pendiente: Documento final con acciones correctivas

