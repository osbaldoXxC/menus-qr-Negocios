2. Esquema Inicial de la Base de Datos (PostgreSQL - 100% Normalizado)

El esquema ha sido normalizado hasta la Tercera Forma Normal (3FN) eliminando arrays y campos JSON no estructurados para garantizar la integridad referencial y escalar las consultas de la IA.

Tablas Principales (Entidades)

1. Restaurantes (Módulo de Panel SaaS)

id (UUID, Primary Key)

nombre (String)

descripcion (Text)

ubicacion_lat (Float)

ubicacion_lng (Float)

suscripcion_activa (Boolean) - Crítico para ABAC

2. Horarios_Restaurante (Normalización de horarios)

id (UUID, Primary Key)

restaurante_id (UUID, Foreign Key)

dia_semana (Int: 1=Lunes, 7=Domingo)

hora_apertura (Time)

hora_cierre (Time)

3. Platillos (El corazón del Discovery Feed)

id (UUID, Primary Key)

restaurante_id (UUID, Foreign Key)

nombre (String)

descripcion (Text)

precio (Decimal)

url_imagen (String) - Apunta a la foto alojada en Amazon S3

categoria_id (UUID, Foreign Key) - Apunta a Categorias_Catalogo

vector_embedding (Vector) - Para búsqueda por similitud con IA (pgvector)

4. Categorias_Catalogo (Normalización de categorías)

id (UUID, Primary Key)

nombre (String) - Ej: Entrada, Plato Fuerte, Bebida

5. Ingredientes_Catalogo

id (UUID, Primary Key)

nombre (String)

es_alergeno_comun (Boolean) - Ej: Cacahuate, Gluten, Mariscos

es_origen_animal (Boolean) - Para filtros Veganos/Vegetarianos

6. Sabores_Catalogo (Normalización de perfiles de sabor)

id (UUID, Primary Key)

nombre (String) - Ej: Picante, Dulce, Umami, Crujiente

7. Usuarios_Comensales (Los que hacen swipe)

id (UUID, Primary Key)

nombre (String)

auth_provider (String: Google, Apple, Email)

Tablas Relacionales (Pivotes M:M)

8. Receta_Platillo (Tabla Pivote: Platillos <-> Ingredientes)

platillo_id (UUID, Foreign Key)

ingrediente_id (UUID, Foreign Key)

tipo_ingrediente (Enum: 'PRINCIPAL', 'COMPLEMENTO') - Separación de receta base y extras

es_modificable (Boolean) - Ej: ¿Se le puede quitar la cebolla?
(Primary Key Compuesta: platillo_id, ingrediente_id)

9. Perfil_Sabor_Platillo (Tabla Pivote: Platillos <-> Sabores)

platillo_id (UUID, Foreign Key)

sabor_id (UUID, Foreign Key)
(Primary Key Compuesta: platillo_id, sabor_id)

10. Interacciones_Feed (Para aprender del usuario)

id (UUID, Primary Key)

usuario_id (UUID, Foreign Key)

platillo_id (UUID, Foreign Key)

tipo_interaccion (Enum: 'SWIPE_DERECHA', 'SWIPE_IZQUIERDA', 'CLICK_DETALLE')

fecha_timestamp (DateTime)