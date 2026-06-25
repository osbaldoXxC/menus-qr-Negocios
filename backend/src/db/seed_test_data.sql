-- Script para poblar datos de prueba para test@example.com
-- ID del restaurante: da706540-862f-490a-9940-1272d63c24b0

-- 1. Limpiar datos previos si existen (opcional, pero ayuda a evitar duplicados en pruebas)
DELETE FROM platillos WHERE restaurante_id = 'da706540-862f-490a-9940-1272d63c24b0';
DELETE FROM categorias_restaurante WHERE restaurante_id = 'da706540-862f-490a-9940-1272d63c24b0';

-- 2. Insertar Categorías
INSERT INTO categorias_restaurante (id, restaurante_id, nombre, orden) VALUES 
(gen_random_uuid(), 'da706540-862f-490a-9940-1272d63c24b0', 'Especialidades', 1),
(gen_random_uuid(), 'da706540-862f-490a-9940-1272d63c24b0', 'Bebidas', 2),
(gen_random_uuid(), 'da706540-862f-490a-9940-1272d63c24b0', 'Postres', 3);

-- 3. Insertar Platillos
INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id)
SELECT 'da706540-862f-490a-9940-1272d63c24b0', 'Tacos al Pastor (Orden)', '5 deliciosos tacos con piña, cebolla y cilantro.', 95.00, id 
FROM categorias_restaurante WHERE nombre = 'Especialidades' AND restaurante_id = 'da706540-862f-490a-9940-1272d63c24b0';

INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id)
SELECT 'da706540-862f-490a-9940-1272d63c24b0', 'Enchiladas Suizas', '4 enchiladas rellenas de pollo con salsa verde cremosa y queso gratinado.', 135.00, id 
FROM categorias_restaurante WHERE nombre = 'Especialidades' AND restaurante_id = 'da706540-862f-490a-9940-1272d63c24b0';

INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id)
SELECT 'da706540-862f-490a-9940-1272d63c24b0', 'Agua de Horchata Grande', 'Refrescante agua artesanal de 500ml.', 35.00, id 
FROM categorias_restaurante WHERE nombre = 'Bebidas' AND restaurante_id = 'da706540-862f-490a-9940-1272d63c24b0';

INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id)
SELECT 'da706540-862f-490a-9940-1272d63c24b0', 'Flan Napolitano', 'Receta clásica de la casa con caramelo suave.', 55.00, id 
FROM categorias_restaurante WHERE nombre = 'Postres' AND restaurante_id = 'da706540-862f-490a-9940-1272d63c24b0';
