-- Test Script for MexxicanMX Schema Validation (v3.0 - 3FN)

-- 1. Insert a test restaurant
INSERT INTO restaurantes (nombre_negocio, email, password_hash, rol, suscripcion_activa)
VALUES ('Tacos de Prueba', 'test@tacos.com', 'hashed_pass', 'RESTAURANTE', true)
RETURNING id AS restaurant_id;

-- 2. Insert test categories
INSERT INTO categorias_catalogo (nombre) VALUES ('Tacos'), ('Bebidas'), ('Entradas')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Insert test ingredients
INSERT INTO ingredientes_catalogo (nombre, es_alergeno_comun) 
VALUES ('Cebolla', false), ('Cilantro', false), ('Piña', false), ('Cacahuate', true)
ON CONFLICT (nombre) DO NOTHING;

-- 4. Insert test flavors
INSERT INTO sabores_catalogo (nombre) VALUES ('Picante'), ('Dulce'), ('Salado')
ON CONFLICT (nombre) DO NOTHING;

-- 5. Insert a test dish with a dummy vector (768 dimensions)
INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id, vector_embedding, estado_ia)
SELECT 
    r.id, 
    'Tacos al Pastor Test', 
    'Deliciosos tacos de prueba con piña', 
    15.50, 
    c.id,
    array_fill(0.1, ARRAY[768])::vector, 
    'completado'
FROM restaurantes r, categorias_catalogo c
WHERE r.email = 'test@tacos.com' AND c.nombre = 'Tacos'
RETURNING id AS dish_id;

-- 6. Associate ingredients (Receta_Platillo)
INSERT INTO receta_platillo (platillo_id, ingrediente_id, tipo_ingrediente)
SELECT d.id, i.id, 'PRINCIPAL'
FROM platillos d, ingredientes_catalogo i
WHERE d.nombre = 'Tacos al Pastor Test' AND i.nombre IN ('Cebolla', 'Cilantro', 'Piña');

-- 7. Associate flavors (Perfil_Sabor_Platillo)
INSERT INTO perfil_sabor_platillo (platillo_id, sabor_id)
SELECT d.id, s.id
FROM platillos d, sabores_catalogo s
WHERE d.nombre = 'Tacos al Pastor Test' AND s.nombre IN ('Picante', 'Dulce');

-- 8. Query to verify everything is linked correctly
SELECT 
    r.nombre_negocio,
    p.nombre AS platillo,
    c.nombre AS categoria,
    p.precio,
    string_agg(DISTINCT i.nombre, ', ') AS ingredientes,
    string_agg(DISTINCT s.nombre, ', ') AS sabores
FROM restaurantes r
JOIN platillos p ON r.id = p.restaurante_id
JOIN categorias_catalogo c ON p.categoria_id = c.id
LEFT JOIN receta_platillo rp ON p.id = rp.platillo_id
LEFT JOIN ingredientes_catalogo i ON rp.ingrediente_id = i.id
LEFT JOIN perfil_sabor_platillo psp ON p.id = psp.platillo_id
LEFT JOIN sabores_catalogo s ON psp.sabor_id = s.id
WHERE r.email = 'test@tacos.com'
GROUP BY r.nombre_negocio, p.nombre, c.nombre, p.precio;

-- 9. Test similarity search (pgvector)
SELECT nombre, 1 - (vector_embedding <=> array_fill(0.1, ARRAY[768])::vector) as similarity
FROM platillos
ORDER BY similarity DESC
LIMIT 1;
