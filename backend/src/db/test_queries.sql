-- 1. Insertar Restaurantes
INSERT INTO restaurantes (nombre_negocio, email, password_hash, plan) 
VALUES ('Tacos El Paisa', 'contacto@elpaisa.com', 'hash_bcrypt_aqui', 'premium');

-- 2. Insertar Categorías Personalizadas
INSERT INTO categorias_restaurante (restaurante_id, nombre, orden) 
SELECT id, 'Entradas', 0 FROM restaurantes WHERE email = 'contacto@elpaisa.com';

INSERT INTO categorias_restaurante (restaurante_id, nombre, orden) 
SELECT id, 'Tacos', 1 FROM restaurantes WHERE email = 'contacto@elpaisa.com';

INSERT INTO categorias_restaurante (restaurante_id, nombre, orden) 
SELECT id, 'Bebidas', 2 FROM restaurantes WHERE email = 'contacto@elpaisa.com';

-- 3. Insertar Ingredientes
INSERT INTO ingredientes_catalogo (nombre, es_alergeno_comun) 
VALUES ('Cebolla', false), ('Cilantro', false), ('Mani', true), ('Camarón', true);

-- 4. Insertar Platillos vinculados a categorías del restaurante
INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id)
SELECT 
    r.id, 
    'Taco al Pastor', 
    'Taco con piña y cilantro', 
    25.00, 
    c.id
FROM restaurantes r, categorias_restaurante c
WHERE r.email = 'contacto@elpaisa.com' AND c.nombre = 'Tacos' AND c.restaurante_id = r.id;

-- 5. Vincular Ingredientes a Platillos
INSERT INTO receta_platillo (platillo_id, ingrediente_id)
SELECT p.id, i.id 
FROM platillos p, ingredientes_catalogo i 
WHERE p.nombre = 'Taco al Pastor' AND i.nombre IN ('Cebolla', 'Cilantro');

-- 6. Consulta para ver el menú completo con categorías ordenadas
SELECT 
    r.nombre_negocio,
    c.nombre as categoria,
    c.orden as cat_orden,
    p.nombre as platillo,
    p.precio
FROM restaurantes r
JOIN categorias_restaurante c ON r.id = c.restaurante_id
JOIN platillos p ON c.id = p.categoria_id
WHERE r.email = 'contacto@elpaisa.com'
ORDER BY c.orden, p.nombre;
