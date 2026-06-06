-- MexxicanMX Database Schema
-- Tarea 5.2: Esquema Relacional PostgreSQL

-- 1. Habilitar extensión pgvector para búsqueda semántica
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla de Restaurantes (Multi-tenant y Auth base)
CREATE TABLE IF NOT EXISTS restaurantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_negocio TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'restaurante',
    estado_activo BOOLEAN DEFAULT true,
    ultimo_pago DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Platillos (Incluye vector para IA)
CREATE TABLE IF NOT EXISTS platillos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria TEXT,
    url_imagen TEXT,
    vector_ia vector(768), -- Dimensiones estándar para embeddings de Gemini/OpenAI
    estado_ia TEXT DEFAULT 'procesando', -- 'procesando' o 'completado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Ingredientes (Catálogo único para gestión de alérgenos)
CREATE TABLE IF NOT EXISTS ingredientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT UNIQUE NOT NULL
);

-- 5. Tabla Intermedia Platillo-Ingredientes (Relación Muchos a Muchos)
CREATE TABLE IF NOT EXISTS platillo_ingredientes (
    platillo_id UUID REFERENCES platillos(id) ON DELETE CASCADE,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
    PRIMARY KEY (platillo_id, ingrediente_id)
);

-- 6. Tabla de Interacciones (Swipes / Likes / Dislikes para el Discovery Feed)
CREATE TABLE IF NOT EXISTS interacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platillo_id UUID NOT NULL REFERENCES platillos(id) ON DELETE CASCADE,
    tipo_accion VARCHAR(20) NOT NULL, -- ej. 'like', 'dislike'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios de tablas
COMMENT ON TABLE restaurantes IS 'Almacena la información de los negocios registrados y su estado de acceso.';
COMMENT ON TABLE platillos IS 'Información de los platillos incluyendo el vector de búsqueda semántica para la IA.';
COMMENT ON TABLE ingredientes IS 'Catálogo global de ingredientes para control de alérgenos.';
COMMENT ON TABLE platillo_ingredientes IS 'Relación entre platillos y sus ingredientes.';
COMMENT ON TABLE interacciones IS 'Registro de swipes realizados por los comensales para el motor de recomendación.';
