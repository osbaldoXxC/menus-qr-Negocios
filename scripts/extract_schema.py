#!/usr/bin/env python3
"""Extrae el esquema real de PostgreSQL y genera el contrato usado por el resto del flujo.

Salidas (en --out, por defecto db/contract):
  schema.json   fuente de verdad legible por maquina
  SCHEMA.md     mismo contenido en markdown, para leer antes de escribir codigo
  schema.lock   hash SHA-256 de schema.json, usado por el preflight de despliegue

Uso:
  python scripts/extract_schema.py --out db/contract
  python scripts/extract_schema.py --url postgresql://user:pass@host:5432/db
"""

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

# Esquemas internos de PostgreSQL y de extensiones: nunca forman parte del contrato.
ESQUEMAS_EXCLUIDOS = ("pg_catalog", "information_schema", "pg_toast")


def conectar(url):
    """Devuelve una conexion abierta, o termina con un mensaje accionable."""
    try:
        import psycopg  # psycopg 3
    except ImportError:
        try:
            import psycopg2 as psycopg  # type: ignore
        except ImportError:
            sys.exit(
                "Falta el driver de PostgreSQL.\n"
                'Instalalo con: pip install "psycopg[binary]"'
            )
    try:
        return psycopg.connect(url)
    except Exception as error:
        sys.exit(
            "No se pudo conectar a PostgreSQL.\n"
            f"  URL usada (sin credenciales): {ocultar_credenciales(url)}\n"
            f"  Error: {error}\n"
            "Verifica que la base este levantada, que DATABASE_URL apunte al entorno "
            "correcto y que tu IP tenga acceso al security group."
        )


def ocultar_credenciales(url):
    """Quita usuario y contrasena de una URL para poder imprimirla sin filtrar nada."""
    if "@" not in url:
        return url
    esquema, resto = url.split("://", 1) if "://" in url else ("", url)
    return f"{esquema}://***@{resto.split('@', 1)[1]}" if esquema else f"***@{resto.split('@', 1)[1]}"


def consultar(conexion, sql, parametros=()):
    with conexion.cursor() as cursor:
        cursor.execute(sql, parametros)
        columnas = [descripcion[0] for descripcion in cursor.description]
        return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]


def extraer(conexion):
    """Construye el diccionario completo del esquema, ordenado de forma estable."""
    filtro = tuple(ESQUEMAS_EXCLUIDOS)

    columnas = consultar(
        conexion,
        """
        SELECT c.table_schema, c.table_name, c.column_name, c.ordinal_position,
               c.data_type, c.udt_name, c.is_nullable, c.column_default,
               c.character_maximum_length, c.numeric_precision, c.numeric_scale
        FROM information_schema.columns c
        JOIN information_schema.tables t
          ON t.table_schema = c.table_schema AND t.table_name = c.table_name
        WHERE c.table_schema NOT IN %s AND t.table_type = 'BASE TABLE'
        ORDER BY c.table_schema, c.table_name, c.ordinal_position
        """,
        (filtro,),
    )

    restricciones = consultar(
        conexion,
        """
        SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type,
               kcu.column_name, kcu.ordinal_position,
               ccu.table_name AS referencia_tabla, ccu.column_name AS referencia_columna
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON kcu.constraint_name = tc.constraint_name
         AND kcu.table_schema = tc.table_schema
        LEFT JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
         AND ccu.table_schema = tc.table_schema
         AND tc.constraint_type = 'FOREIGN KEY'
        WHERE tc.table_schema NOT IN %s
        ORDER BY tc.table_schema, tc.table_name, tc.constraint_name, kcu.ordinal_position
        """,
        (filtro,),
    )

    indices = consultar(
        conexion,
        """
        SELECT schemaname AS table_schema, tablename AS table_name,
               indexname AS index_name, indexdef AS definicion
        FROM pg_indexes
        WHERE schemaname NOT IN %s
        ORDER BY schemaname, tablename, indexname
        """,
        (filtro,),
    )

    enums = consultar(
        conexion,
        """
        SELECT t.typname AS nombre, e.enumlabel AS valor
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname NOT IN %s
        ORDER BY t.typname, e.enumsortorder
        """,
        (filtro,),
    )

    extensiones = consultar(
        conexion,
        "SELECT extname AS nombre, extversion AS version FROM pg_extension ORDER BY extname",
    )

    vistas = consultar(
        conexion,
        """
        SELECT table_schema, table_name
        FROM information_schema.views
        WHERE table_schema NOT IN %s
        ORDER BY table_schema, table_name
        """,
        (filtro,),
    )

    tablas = {}
    for fila in columnas:
        clave = f"{fila['table_schema']}.{fila['table_name']}"
        tabla = tablas.setdefault(
            clave,
            {
                "esquema": fila["table_schema"],
                "nombre": fila["table_name"],
                "columnas": [],
                "clave_primaria": [],
                "unicos": [],
                "llaves_foraneas": [],
                "indices": [],
            },
        )
        tabla["columnas"].append(
            {
                "nombre": fila["column_name"],
                "tipo": fila["udt_name"] if fila["data_type"] == "USER-DEFINED" else fila["data_type"],
                "nulable": fila["is_nullable"] == "YES",
                "default": fila["column_default"],
                "longitud_maxima": fila["character_maximum_length"],
                "precision": fila["numeric_precision"],
                "escala": fila["numeric_scale"],
            }
        )

    for fila in restricciones:
        clave = f"{fila['table_schema']}.{fila['table_name']}"
        if clave not in tablas or not fila["column_name"]:
            continue
        tabla = tablas[clave]
        if fila["constraint_type"] == "PRIMARY KEY":
            tabla["clave_primaria"].append(fila["column_name"])
        elif fila["constraint_type"] == "UNIQUE":
            tabla["unicos"].append(
                {"restriccion": fila["constraint_name"], "columna": fila["column_name"]}
            )
        elif fila["constraint_type"] == "FOREIGN KEY":
            tabla["llaves_foraneas"].append(
                {
                    "columna": fila["column_name"],
                    "referencia_tabla": fila["referencia_tabla"],
                    "referencia_columna": fila["referencia_columna"],
                }
            )

    for fila in indices:
        clave = f"{fila['table_schema']}.{fila['table_name']}"
        if clave in tablas:
            tablas[clave]["indices"].append(
                {"nombre": fila["index_name"], "definicion": fila["definicion"]}
            )

    agrupado_enums = {}
    for fila in enums:
        agrupado_enums.setdefault(fila["nombre"], []).append(fila["valor"])

    return {
        "tablas": [tablas[clave] for clave in sorted(tablas)],
        "enums": agrupado_enums,
        "extensiones": {fila["nombre"]: fila["version"] for fila in extensiones},
        "vistas": [f"{fila['table_schema']}.{fila['table_name']}" for fila in vistas],
    }


def escribir_markdown(esquema, destino):
    lineas = [
        "# Contrato de esquema — MexxicanMX",
        "",
        "Generado por `scripts/extract_schema.py`. **No editar a mano.**",
        "Ningun nombre fuera de este archivo puede usarse en consultas, modelos o DTOs.",
        "",
        "## Contenido",
        "- Extensiones",
        "- Tipos enum",
        "- Tablas",
        "- Vistas",
        "",
        "## Extensiones",
        "",
    ]
    for nombre, version in sorted(esquema["extensiones"].items()):
        lineas.append(f"- `{nombre}` {version}")

    lineas += ["", "## Tipos enum", ""]
    if esquema["enums"]:
        for nombre, valores in sorted(esquema["enums"].items()):
            lineas.append(f"- `{nombre}`: {', '.join('`' + v + '`' for v in valores)}")
    else:
        lineas.append("_Sin tipos enum definidos._")

    lineas += ["", "## Tablas", ""]
    for tabla in esquema["tablas"]:
        lineas.append(f"### `{tabla['esquema']}.{tabla['nombre']}`")
        lineas.append("")
        lineas.append("| Columna | Tipo | Nulable | Default |")
        lineas.append("|---|---|---|---|")
        for columna in tabla["columnas"]:
            default = columna["default"] or ""
            lineas.append(
                f"| `{columna['nombre']}` | {columna['tipo']} | "
                f"{'si' if columna['nulable'] else 'no'} | `{default}` |"
                if default
                else f"| `{columna['nombre']}` | {columna['tipo']} | "
                f"{'si' if columna['nulable'] else 'no'} | |"
            )
        lineas.append("")
        if tabla["clave_primaria"]:
            lineas.append(f"- PK: {', '.join('`' + c + '`' for c in tabla['clave_primaria'])}")
        for fk in tabla["llaves_foraneas"]:
            lineas.append(
                f"- FK: `{fk['columna']}` → `{fk['referencia_tabla']}.{fk['referencia_columna']}`"
            )
        for unico in tabla["unicos"]:
            lineas.append(f"- UNIQUE: `{unico['columna']}` ({unico['restriccion']})")
        if any(c["nombre"] == "deleted_at" for c in tabla["columnas"]):
            lineas.append("- **Soft delete activo**: toda lectura debe filtrar `deleted_at IS NULL`.")
        lineas.append("")

    lineas += ["## Vistas", ""]
    lineas += [f"- `{vista}`" for vista in esquema["vistas"]] or ["_Sin vistas._"]
    lineas.append("")
    destino.write_text("\n".join(lineas), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Extrae el contrato de esquema de PostgreSQL.")
    parser.add_argument(
        "--url",
        default=os.environ.get("DATABASE_URL"),
        help="URL de conexion. Por defecto toma DATABASE_URL del entorno.",
    )
    parser.add_argument("--out", default="db/contract", help="Directorio de salida.")
    argumentos = parser.parse_args()

    if not argumentos.url:
        sys.exit(
            "Falta la URL de conexion.\n"
            "Pasa --url postgresql://usuario:clave@host:5432/base "
            "o exporta DATABASE_URL."
        )

    salida = Path(argumentos.out)
    salida.mkdir(parents=True, exist_ok=True)

    conexion = conectar(argumentos.url)
    try:
        esquema = extraer(conexion)
    finally:
        conexion.close()

    if not esquema["tablas"]:
        sys.exit(
            "La conexion funciono pero no se encontro ninguna tabla.\n"
            "Probablemente apuntas a una base vacia o al entorno equivocado."
        )

    json_texto = json.dumps(esquema, indent=2, ensure_ascii=False, sort_keys=True)
    (salida / "schema.json").write_text(json_texto + "\n", encoding="utf-8")
    escribir_markdown(esquema, salida / "SCHEMA.md")

    huella = hashlib.sha256(json_texto.encode("utf-8")).hexdigest()
    (salida / "schema.lock").write_text(huella + "\n", encoding="utf-8")

    total_columnas = sum(len(t["columnas"]) for t in esquema["tablas"])
    print(f"Tablas: {len(esquema['tablas'])}  Columnas: {total_columnas}")
    print(f"Enums: {len(esquema['enums'])}  Extensiones: {len(esquema['extensiones'])}")
    print(f"Escrito en {salida}/schema.json, SCHEMA.md, schema.lock")
    print(f"schema.lock = {huella[:16]}...")


if __name__ == "__main__":
    main()
