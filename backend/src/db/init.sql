-- MexxicanMX Database Schema (v3.0 - 100% Normalizado 3FN - IA Standby)
-- Tarea 5.2: Esquema Relacional PostgreSQL

-- 1. Habilitar extensión pgvector (Se mantiene la capacidad, aunque no se use activamente)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla de Restaurantes (Módulo de Panel SaaS)
CREATE TABLE IF NOT EXISTS restaurantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_negocio VARCHAR(255) NOT NULL,
    descripcion TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    ubicacion_lat FLOAT,
    ubicacion_lng FLOAT,
    suscripcion_activa BOOLEAN DEFAULT true, -- Crítico para ABAC
    rol VARCHAR(50) NOT NULL DEFAULT 'RESTAURANTE', -- 'RESTAURANTE', 'SUPER_ADMIN'
    plan VARCHAR(50) DEFAULT 'basico', -- 'basico', 'premium'
    ultimo_pago DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Configuración de Tema (Branding Premium)
DO $$ BEGIN
    CREATE TYPE layout_style AS ENUM ('LISTA_SIMPLE', 'CUADRICULA_FOTOS', 'TARJETAS_DETALLADAS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS configuracion_tema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID UNIQUE NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    logo_url TEXT,
    banner_url TEXT,
    color_primario VARCHAR(7) DEFAULT '#E63946',
    color_fondo VARCHAR(7) DEFAULT '#F1FAEE',
    fuente_familia VARCHAR(50) DEFAULT 'Sans-Serif',
    layout_type layout_style DEFAULT 'TARJETAS_DETALLADAS',
    banner_promocional_activo BOOLEAN DEFAULT false,
    banner_promocional_texto TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.1 Tabla para manejo de Refresh Tokens (Seguridad)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Horarios_Restaurante (Normalización de horarios)
CREATE TABLE IF NOT EXISTS horarios_restaurante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    dia_semana INT CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Categorias_Restaurante (ABAC - Categorías por restaurante con ordenamiento)
CREATE TABLE IF NOT EXISTS categorias_restaurante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurante_id, nombre)
);

-- 5. Platillos (El corazón del Discovery Feed)
CREATE TABLE IF NOT EXISTS platillos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    url_imagen TEXT, -- Apunta a S3
    categoria_id UUID REFERENCES categorias_restaurante(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true, -- Soporte para pausado lógico
    vector_ia vector(768), -- Restaurado a vector_ia para compatibilidad con código actual
    estado_ia VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'procesando', 'completado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Ingredientes_Catalogo
CREATE TABLE IF NOT EXISTS ingredientes_catalogo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) UNIQUE NOT NULL,
    es_alergeno_comun BOOLEAN DEFAULT false,
    es_origen_animal BOOLEAN DEFAULT false
);

-- 7. Sabores_Catalogo (Normalización de perfiles de sabor)
CREATE TABLE IF NOT EXISTS sabores_catalogo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL -- Ej: Picante, Dulce, Umami, Crujiente
);

-- 8. Usuarios_Comensales (Los que hacen swipe)
CREATE TABLE IF NOT EXISTS usuarios_comensales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50), -- 'Google', 'Apple', 'Email', 'Anonimo'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Receta_Platillo (Pivote M:M - Platillos <-> Ingredientes)
CREATE TABLE IF NOT EXISTS receta_platillo (
    platillo_id UUID REFERENCES platillos(id) ON DELETE CASCADE,
    ingrediente_id UUID REFERENCES ingredientes_catalogo(id) ON DELETE CASCADE,
    tipo_ingrediente VARCHAR(50) DEFAULT 'PRINCIPAL', -- 'PRINCIPAL', 'COMPLEMENTO'
    es_modificable BOOLEAN DEFAULT true, -- ¿Se le puede quitar la cebolla?
    PRIMARY KEY (platillo_id, ingrediente_id)
);

-- 10. Perfil_Sabor_Platillo (Pivote M:M - Platillos <-> Sabores)
CREATE TABLE IF NOT EXISTS perfil_sabor_platillo (
    platillo_id UUID REFERENCES platillos(id) ON DELETE CASCADE,
    sabor_id UUID REFERENCES sabores_catalogo(id) ON DELETE CASCADE,
    PRIMARY KEY (platillo_id, sabor_id)
);

-- 11. Interacciones_Feed (Para aprender del usuario)
CREATE TABLE IF NOT EXISTS interacciones_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios_comensales(id) ON DELETE SET NULL,
    platillo_id UUID NOT NULL REFERENCES platillos(id) ON DELETE CASCADE,
    tipo_interaccion VARCHAR(50) NOT NULL, -- 'SWIPE_DERECHA', 'SWIPE_IZQUIERDA', 'CLICK_DETALLE'
    fecha_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios
COMMENT ON TABLE restaurantes IS 'Almacena la información de los negocios registrados y su estado de acceso.';
COMMENT ON TABLE horarios_restaurante IS 'Horarios de apertura y cierre normalizados por día.';
COMMENT ON TABLE platillos IS 'Información de los platillos. La IA está en espera (Épica 7).';
COMMENT ON TABLE ingredientes_catalogo IS 'Catálogo global de ingredientes con metadatos de alérgenos y dieta.';
COMMENT ON TABLE receta_platillo IS 'Relación detallada de ingredientes por platillo.';
COMMENT ON TABLE interacciones_feed IS 'Registro de actividad de los comensales.';


-- 12. ÍNDICES DE OPTIMIZACIÓN DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_restaurantes_email ON restaurantes(email);
CREATE INDEX IF NOT EXISTS idx_platillos_restaurante ON platillos(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_categorias_restaurante_id ON categorias_restaurante(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_platillos_activo ON platillos(activo) WHERE activo = true;
