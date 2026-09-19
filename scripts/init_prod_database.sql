-- ==============================================================================
-- INICIALIZACIÓN LIMPIA DE PRODUCCIÓN - MEXXICANMX
-- ==============================================================================
-- Este script puebla los catálogos maestros y el usuario SUPER_ADMIN.
-- CERO RESTAURANTES DEMO NI PLATILLOS DEMO.
-- Totalmente idempotente (ON CONFLICT DO NOTHING / DO UPDATE).
-- ==============================================================================

-- 1. Catálogo Global de Tamaños de Porción
INSERT INTO tamanos_porcion (nombre) VALUES
('Individual'),
('Para Compartir (2-3 personas)'),
('Familiar (4-5 personas)'),
('Degustación')
ON CONFLICT DO NOTHING;

-- 2. Catálogo Global de Tipos de Cocina
INSERT INTO cocinas_catalogo (nombre) VALUES
('Mexicana Tradicional'),
('Taquería & Antojitos'),
('Mariscos & Pescados'),
('Cortes & Parrilla'),
('Italiana & Pastas'),
('Pizzería Artesanal'),
('Hamburguesas & Grill'),
('Oriental & Asiática'),
('Japonesa & Sushi'),
('Cafetería & Repostería'),
('Saludable & Vegana'),
('Internacional & Fusión'),
('Comida Rápida & Snacks')
ON CONFLICT DO NOTHING;

-- 3. Catálogo Global de Sabores
INSERT INTO sabores_catalogo (nombre) VALUES
('Picante'),
('Dulce'),
('Salado'),
('Ácido'),
('Ahumado'),
('Umami'),
('Crujiente'),
('Cremoso'),
('Herbal / Fresco'),
('Agridulce')
ON CONFLICT DO NOTHING;

-- 4. Catálogo Base de Ingredientes Comunes (Con metadatos de alérgenos y origen animal)
INSERT INTO ingredientes_catalogo (nombre, es_alergeno_comun, es_origen_animal) VALUES
('Carne de Res', false, true),
('Carne de Cerdo', false, true),
('Pollo', false, true),
('Pescado', true, true),
('Camarón / Mariscos', true, true),
('Huevo', true, true),
('Queso / Lácteos', true, true),
('Leche', true, true),
('Harina de Trigo / Gluten', true, false),
('Cacahuate / Maní', true, false),
('Nuez / Frutos Secos', true, false),
('Soya', true, false),
('Sésamo / Ajonjolí', true, false),
('Maíz', false, false),
('Cebolla', false, false),
('Cilantro', false, false),
('Tomate / Jitomate', false, false),
('Aguacate', false, false),
('Chile Jalapeño', false, false),
('Chile Serrano', false, false),
('Chile Habanero', false, false),
('Limón', false, false),
('Ajo', false, false),
('Frijoles', false, false),
('Arroz', false, false)
ON CONFLICT DO NOTHING;

-- 5. Usuario SUPER_ADMIN de Producción
-- Hash generado con bcrypt (12 salt rounds) para la contraseña Martinez24
INSERT INTO restaurantes (
    id,
    nombre_negocio,
    email,
    password_hash,
    nombre_dueno,
    rol,
    plan,
    estado,
    suscripcion_activa,
    email_verificado,
    dias_licencia
)
VALUES (
    gen_random_uuid(),
    'Super Admin',
    'baldo2005_@outlook.com',
    '$2b$12$DkJ7lVp9t2s57s4d0qfTZe4.tBfOa6/qH642B5YmC81Y8n7C8W6.y',
    'Osbaldo',
    'SUPER_ADMIN',
    'premium',
    'aprobado',
    true,
    true,
    365
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    rol = 'SUPER_ADMIN',
    estado = 'aprobado',
    suscripcion_activa = true,
    email_verificado = true;

-- Fin de inicialización limpia
