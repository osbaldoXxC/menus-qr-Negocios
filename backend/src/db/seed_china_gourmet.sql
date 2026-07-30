-- Seed data para Restaurante Chino (Gran Dragón Dorado) y Restaurante Gourmet (L'Étoile Gourmet)
-- UUIDs fijos para poder mapear en mocks y pruebas de Playwright de forma consistente
-- ID Chino: 22222222-2222-2222-2222-222222222222
-- ID Gourmet: 33333333-3333-3333-3333-333333333333

-- Limpiar datos previos si existen
DELETE FROM platillos WHERE restaurante_id IN ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM categorias_restaurante WHERE restaurante_id IN ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM configuracion_tema WHERE restaurante_id IN ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM restaurantes WHERE id IN ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');

-- 1. Insertar Restaurantes
-- Contraseña 'password123' hasheada con bcrypt: $2a$12$aUKZNlIOptqDysnStdoWrOyMo5op/CNDv6Y2jdEGtouZYkcXyUPhe
INSERT INTO restaurantes (id, nombre_negocio, descripcion, email, password_hash, nombre_dueno, slug, suscripcion_activa, rol, plan, email_verificado, estado) VALUES 
('22222222-2222-2222-2222-222222222222', 'Gran Dragón Dorado', 'Auténtica comida china imperial al wok y dumplings tradicionales.', 'china@test.com', '$2a$12$aUKZNlIOptqDysnStdoWrOyMo5op/CNDv6Y2jdEGtouZYkcXyUPhe', 'Lee Chen', 'gran-dragon-dorado', true, 'RESTAURANTE', 'premium', true, 'aprobado'),
('33333333-3333-3333-3333-333333333333', 'L''Étoile Gourmet', 'Experiencia culinaria de alta cocina y platos gourmet de autor.', 'gourmet@test.com', '$2a$12$aUKZNlIOptqDysnStdoWrOyMo5op/CNDv6Y2jdEGtouZYkcXyUPhe', 'Pierre gourmet', 'letoile-gourmet', true, 'RESTAURANTE', 'premium', true, 'aprobado');

-- 2. Insertar Configuración de Tema (Branding de Diseño)
INSERT INTO configuracion_tema (restaurante_id, logo_url, banner_url, color_primario, color_fondo, fuente_familia, layout_type) VALUES
('22222222-2222-2222-2222-222222222222', '', '/comidaChina.jpg', '#D92B2B', '#0F0A0A', 'Serif', 'TARJETAS_DETALLADAS'),
('33333333-3333-3333-3333-333333333333', '', '/ComidaHurmet.jpg', '#D4AF37', '#0A0D10', 'Serif', 'TARJETAS_DETALLADAS');

-- 3. Insertar Categorías para el Restaurante Chino
INSERT INTO categorias_restaurante (id, restaurante_id, nombre, orden) VALUES
('cc111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Entradas Tradicionales', 1),
('cc222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Especialidades al Wok', 2),
('cc333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Arroces y Fideos', 3);

-- 4. Insertar Platillos para el Restaurante Chino
INSERT INTO platillos (id, restaurante_id, nombre, descripcion, precio, url_imagen, categoria_id, activo) VALUES
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Dumplings al Vapor (Jiaozi)', 'Empanadillas rellenas de cerdo molido finamente y cebollín con un toque de jengibre y soya.', 125.00, '/images/china1.jpg', 'cc111111-1111-1111-1111-111111111111', true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Sopa Wonton Tradicional', 'Caldo aromático de ave con wontons caseros rellenos de camarón, cerdo y aceite de sésamo.', 110.00, '/images/china4.jpg', 'cc111111-1111-1111-1111-111111111111', true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Pato Pekín Laminado', 'Pato laqueado y crujiente al estilo imperial, servido con crepas delgadas y salsa hoisin.', 450.00, '/images/china2.jpg', 'cc222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Cerdo Agridulce Clásico', 'Trozos crujientes de cerdo salteados al wok con pimientos, cebolla y piña en salsa agridulce.', 165.00, '/images/china3.jpg', 'cc222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Pollo Kung Pao', 'Cubos de pechuga salteados con cacahuates, chiles secos y pimientos en una salsa picante especial.', 180.00, '/images/china5.jpg', 'cc222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Ternera en Salsa de Ostras', 'Láminas tiernas de ternera salteadas al wok con brócoli fresco en salsa de ostión tradicional.', 195.00, '/images/china8.jpg', 'cc222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Arroz Frito Tres Delicias', 'Arroz salteado al wok con camarones, cerdo char siu, huevo y vegetales selectos.', 140.00, '/images/china6.jpg', 'cc333333-3333-3333-3333-333333333333', true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Fideos Chow Mein al Carbón', 'Fideos salteados a fuego alto con juliana de verduras y pechuga de pollo deshebrada.', 155.00, '/images/china7.jpg', 'cc333333-3333-3333-3333-333333333333', true);

-- 5. Insertar Categorías para el Restaurante Gourmet
INSERT INTO categorias_restaurante (id, restaurante_id, nombre, orden) VALUES
('c9111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Entradas Exclusivas', 1),
('c9222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Platos Fuertes de Autor', 2),
('c9333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Postres de Autor', 3);

-- 6. Insertar Platillos para el Restaurante Gourmet
INSERT INTO platillos (id, restaurante_id, nombre, descripcion, precio, url_imagen, categoria_id, activo) VALUES
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Tártara de Atún Aleta Azul', 'Atún fresco de ensenada marinado en cítricos y soya, rábano sandía y aderezo de sésamo.', 285.00, '/images/gourmet1.jpg', 'c9111111-1111-1111-1111-111111111111', true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Carpaccio de Pulpo del Atlántico', 'Finas láminas de pulpo con aceite de oliva extra virgen, alcaparras baby y arúgula orgánica.', 260.00, '/images/gourmet6.jpg', 'c9111111-1111-1111-1111-111111111111', true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Crema de Langosta al Coñac', 'Sopa aterciopelada de langosta de California aromatizada con coñac y crema fresca.', 220.00, '/images/gourmet7.jpg', 'c9111111-1111-1111-1111-111111111111', true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Filete Mignon al Oporto', 'Corte premium tierno a la parrilla con reducción de vino de Oporto y puré de papa trufado.', 480.00, '/images/gourmet2.jpg', 'c9222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Salmón en Costra de Pistaches', 'Salmón fresco sellado al horno con costra crujiente de pistaches y quinoa orgánica.', 360.00, '/images/gourmet3.jpg', 'c9222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Risotto de Hongos Silvestres', 'Arroz arborio cocinado a fuego lento con boletus, portobellos y parmesano Reggiano.', 290.00, '/images/gourmet4.jpg', 'c9222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Magret de Pato a la Naranja', 'Pechuga de pato sellada a término medio, bañada en una sutil salsa dulce de cítricos.', 390.00, '/images/gourmet5.jpg', 'c9222222-2222-2222-2222-222222222222', true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Volcán de Chocolate Belga', 'Bizcocho húmedo de cacao con interior líquido fundido, servido con helado artesanal de vainilla.', 145.00, '/images/gourmet8.jpg', 'c9333333-3333-3333-3333-333333333333', true);
