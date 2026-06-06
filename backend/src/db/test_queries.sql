-- Test Script for MexxicanMX Schema Validation

-- 1. Insert a test restaurant
INSERT INTO restaurantes (nombre_negocio, email, password_hash, rol, ultimo_pago)
VALUES ('Tacos de Prueba', 'test@tacos.com', 'hashed_pass', 'restaurante', CURRENT_DATE)
RETURNING id AS restaurant_id;

-- 2. Insert test ingredients
INSERT INTO ingredientes (nombre) VALUES ('Cebolla'), ('Cilantro'), ('Piña')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Insert a test dish with a dummy vector (768 dimensions)
-- Using a small array and casting to vector
INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria, vector_ia, estado_ia)
SELECT 
    id, 
    'Tacos al Pastor Test', 
    'Deliciosos tacos de prueba', 
    15.50, 
    'Tacos', 
    array_fill(0.1, ARRAY[768])::vector, 
    'completado'
FROM restaurantes WHERE email = 'test@tacos.com'
RETURNING id AS dish_id;

-- 4. Associate ingredients with the dish
INSERT INTO platillo_ingredientes (platillo_id, ingrediente_id)
SELECT d.id, i.id
FROM platillos d, ingredientes i
WHERE d.nombre = 'Tacos al Pastor Test' AND i.nombre IN ('Cebolla', 'Cilantro', 'Piña');

-- 5. Query to verify everything is linked correctly
SELECT 
    r.nombre_negocio,
    p.nombre AS platillo,
    p.precio,
    string_agg(i.nombre, ', ') AS ingredientes
FROM restaurantes r
JOIN platillos p ON r.id = p.restaurante_id
LEFT JOIN platillo_ingredientes pi ON p.id = pi.platillo_id
LEFT JOIN ingredientes i ON pi.ingrediente_id = i.id
WHERE r.email = 'test@tacos.com'
GROUP BY r.nombre_negocio, p.nombre, p.precio;

-- 6. Test similarity search (pgvector)
-- Find dishes similar to a target vector (using cosine distance <=>)
SELECT nombre, vector_ia <=> array_fill(0.1, ARRAY[768])::vector as distance
FROM platillos
ORDER BY distance ASC
LIMIT 1;
