#!/usr/bin/env python3
"""Valida que el codigo use exactamente las tablas y columnas que existen en la base.

Detecta:
  1. Tablas referenciadas en SQL que no existen.
  2. Columnas calificadas (tabla.columna o alias.columna) que no existen.
  3. Columnas escritas en camelCase dentro de SQL (createdAt en lugar de created_at).
  4. __tablename__ (SQLAlchemy) y tableName (Sequelize) sin tabla correspondiente.
  5. Lecturas de tablas con soft delete que no filtran deleted_at.

Salida: reporte con archivo:linea y la sugerencia mas cercana. Codigo de salida 1 si
hay hallazgos. Los falsos positivos se silencian agregando el identificador a
db/contract/schema-allowlist.txt (una entrada por linea, # para comentarios).

Uso:
  python scripts/validate_code_vs_schema.py --schema db/contract/schema.json --root .
"""

import argparse
import difflib
import json
import re
import sys
from pathlib import Path

EXTENSIONES_CODIGO = (".py", ".js", ".ts", ".tsx", ".jsx", ".sql")

# Directorios que nunca contienen codigo de aplicacion propio.
DIRECTORIOS_IGNORADOS = {
    ".git", "node_modules", "dist", "build", ".next", "venv", ".venv",
    "__pycache__", ".mypy_cache", ".pytest_cache", "coverage", "db/contract",
}

# Tablas tras FROM / JOIN / INSERT INTO / UPDATE / DELETE FROM.
# El lookahead negativo en "update" evita que "ON CONFLICT (...) DO UPDATE SET"
# (upsert de Postgres, sin nombre de tabla despues de UPDATE) capture "SET" como tabla.
PATRON_TABLA = re.compile(
    r"\b(?:from|join|insert\s+into|update(?!\s+set\b)|delete\s+from)\s+"
    r'(?:"?(?P<esquema>[a-zA-Z_][\w]*)"?\.)?"?(?P<tabla>[a-zA-Z_][\w]*)"?',
    re.IGNORECASE,
)

# Cadenas que delimitan literales de texto en Python/JS/TS: comillas triples,
# comillas simples/dobles y template literals. Solo dentro de estas -y en archivos
# .sql completos- tiene sentido buscar SQL; fuera de ellas (imports, comentarios,
# codigo JS/TS normal) las mismas palabras dan falsos positivos.
PATRON_LITERAL = re.compile(
    r'"""(?:\\.|[^"\\])*"""'
    r"|'''(?:\\.|[^'\\])*'''"
    r'|"(?:\\.|[^"\\\n])*"'
    r"|'(?:\\.|[^'\\\n])*'"
    r"|`(?:\\.|[^`\\])*`",
    re.DOTALL,
)

# Esquemas de catalogo interno de Postgres: legitimos en scripts de auditoria/extraccion,
# nunca son "el esquema de la aplicacion" que describe schema.json.
ESQUEMAS_SISTEMA = {"information_schema", "pg_catalog"}


def quitar_comentarios_sql(texto):
    """Sustituye comentarios `-- linea` y `/* bloque */` por espacios, preservando
    la longitud y los saltos de linea (para no desalinear numero_de_linea). Sin esto,
    un comentario como "-- Changed from TEXT to JSONB" se lee como `FROM TEXT` y
    dispara TABLA_INEXISTENTE sobre una palabra que nunca fue SQL ejecutable.
    """
    resultado = []
    i, n = 0, len(texto)
    while i < n:
        if texto[i : i + 2] == "--":
            fin = texto.find("\n", i)
            fin = n if fin == -1 else fin
            resultado.append(" " * (fin - i))
            i = fin
        elif texto[i : i + 2] == "/*":
            fin = texto.find("*/", i + 2)
            fin = n if fin == -1 else fin + 2
            resultado.append("".join(" " if c != "\n" else "\n" for c in texto[i:fin]))
            i = fin
        else:
            resultado.append(texto[i])
            i += 1
    return "".join(resultado)


def fragmentos_sql(texto, extension):
    """Genera (offset, fragmento) para cada sentencia SQL delimitada de forma natural:
    cada literal de cadena que contiene SQL, o cada sentencia separada por ';' en un
    archivo .sql. Un archivo con varias consultas separadas en llamadas distintas a
    db.execute(...) produce varios fragmentos, no uno solo -evita que la deteccion de
    soft-delete colapse la segunda y tercera consulta dentro de la primera-.
    """
    if extension == ".sql":
        limpio = quitar_comentarios_sql(texto)
        cursor = 0
        for sentencia in limpio.split(";"):
            if sentencia.strip():
                yield (cursor, sentencia)
            cursor += len(sentencia) + 1
        return
    for coincidencia in PATRON_LITERAL.finditer(texto):
        fragmento = coincidencia.group(0)
        if re.search(r"\b(select|insert|update|delete)\b", fragmento, re.IGNORECASE):
            yield (coincidencia.start(), fragmento)

# Referencias calificadas: prefijo.columna
PATRON_CALIFICADA = re.compile(r'\b(?P<prefijo>[a-zA-Z_][\w]*)\."?(?P<columna>[a-zA-Z_][\w]*)"?')

PATRON_TABLENAME_PY = re.compile(r'__tablename__\s*=\s*["\'](?P<valor>[\w]+)["\']')
PATRON_TABLENAME_JS = re.compile(r'tableName\s*:\s*["\'](?P<valor>[\w]+)["\']')

PATRON_CAMEL = re.compile(r"^[a-z]+(?:[A-Z][a-z0-9]*)+$")

# Palabras que aparecen tras FROM/JOIN pero no son tablas, incluyendo vistas y
# catalogos internos de Postgres que se consultan sin prefijo de esquema cuando
# information_schema/pg_catalog estan en el search_path.
NO_TABLAS = {
    "select", "lateral", "unnest", "generate_series", "values", "dual",
    "only", "table", "json_to_record", "jsonb_to_record", "set",
    "tables", "columns", "views", "table_constraints", "key_column_usage",
    "constraint_column_usage", "referential_constraints",
    "pg_indexes", "pg_index", "pg_type", "pg_enum", "pg_namespace",
    "pg_extension", "pg_attribute", "pg_constraint",
}

# Prefijos frecuentes de objetos JS/Python que no son alias de tabla.
NO_ALIAS = {
    "this", "self", "req", "res", "err", "error", "console", "process", "window",
    "document", "json", "os", "sys", "db", "client", "pool", "app", "router",
    "logger", "config", "settings", "data", "response", "result", "row", "rows",
    "math", "date", "array", "object", "string", "number", "promise", "np", "pd",
}


def cargar_esquema(ruta):
    try:
        datos = json.loads(Path(ruta).read_text(encoding="utf-8"))
    except FileNotFoundError:
        sys.exit(
            f"No existe {ruta}.\n"
            "Ejecuta primero: python scripts/extract_schema.py --out db/contract"
        )
    except json.JSONDecodeError as error:
        sys.exit(f"{ruta} no es JSON valido: {error}")

    tablas = {}
    for tabla in datos.get("tablas", []):
        tablas[tabla["nombre"]] = {
            "columnas": {c["nombre"] for c in tabla["columnas"]},
            "soft_delete": any(c["nombre"] == "deleted_at" for c in tabla["columnas"]),
        }
    if not tablas:
        sys.exit(f"{ruta} no contiene tablas. Regenera el contrato.")
    return tablas


def cargar_allowlist(ruta):
    archivo = Path(ruta)
    if not archivo.exists():
        return set()
    entradas = set()
    for linea in archivo.read_text(encoding="utf-8").splitlines():
        limpia = linea.split("#", 1)[0].strip()
        if limpia:
            entradas.add(limpia)
    return entradas


def archivos_de_codigo(raiz):
    for ruta in sorted(Path(raiz).rglob("*")):
        if ruta.suffix not in EXTENSIONES_CODIGO or not ruta.is_file():
            continue
        partes = set(ruta.parts)
        if partes & DIRECTORIOS_IGNORADOS:
            continue
        if any(str(ruta).replace("\\", "/").startswith(d) for d in DIRECTORIOS_IGNORADOS):
            continue
        yield ruta


def sugerencia(nombre, candidatos):
    cercanos = difflib.get_close_matches(nombre, sorted(candidatos), n=1, cutoff=0.6)
    return f" ¿Quisiste decir `{cercanos[0]}`?" if cercanos else ""


def a_snake(nombre):
    return re.sub(r"(?<!^)(?=[A-Z])", "_", nombre).lower()


def numero_de_linea(texto, posicion):
    return texto.count("\n", 0, posicion) + 1


def enmascarar_fuera_de_sql(texto, extension):
    """Devuelve una copia de `texto` con la misma longitud y saltos de linea, donde
    solo sobrevive el contenido de literales de cadena que parecen SQL real (contienen
    SELECT/INSERT/UPDATE/DELETE). Todo lo demas -imports, comentarios, codigo JS/TS
    normal, docstrings sin SQL- se sustituye por espacios.

    Esto es lo que evita que `from fastapi import X` se lea como `FROM fastapi`,
    que `restaurantes.filter(...)` se lea como `alias.columna`, o que un comentario
    en espanol como "tras FROM/JOIN pero no son tablas" dispare un hallazgo.

    Los archivos .sql se devuelven casi intactos -solo se les quitan los comentarios-:
    ahi el resto del contenido es SQL legitimo.
    """
    if extension == ".sql":
        return quitar_comentarios_sql(texto)

    mascara = ["\n" if caracter == "\n" else " " for caracter in texto]
    for coincidencia in PATRON_LITERAL.finditer(texto):
        fragmento = coincidencia.group(0)
        if re.search(r"\b(select|insert|update|delete)\b", fragmento, re.IGNORECASE):
            inicio, fin = coincidencia.span()
            mascara[inicio:fin] = list(fragmento)
    return "".join(mascara)


def revisar_archivo(ruta, texto_original, tablas, allowlist):
    hallazgos = []
    todas_columnas = {c for tabla in tablas.values() for c in tabla["columnas"]}
    texto = enmascarar_fuera_de_sql(texto_original, ruta.suffix)

    # Alias declarados en el archivo: FROM tabla alias / JOIN tabla AS alias
    alias = {}
    for coincidencia in re.finditer(
        r"\b(?:from|join)\s+\"?([a-zA-Z_][\w]*)\"?\s+(?:as\s+)?\"?([a-zA-Z_][\w]*)\"?",
        texto,
        re.IGNORECASE,
    ):
        tabla, posible_alias = coincidencia.group(1), coincidencia.group(2)
        if tabla in tablas and posible_alias.lower() not in {"on", "where", "set", "using", "inner", "left", "right", "outer", "join", "group", "order", "limit"}:
            alias[posible_alias] = tabla

    for coincidencia in PATRON_TABLA.finditer(texto):
        tabla = coincidencia.group("tabla")
        esquema = coincidencia.group("esquema")
        if esquema and esquema.lower() in ESQUEMAS_SISTEMA:
            continue
        if tabla.lower() in NO_TABLAS or tabla in allowlist or tabla in tablas:
            continue
        hallazgos.append(
            (
                numero_de_linea(texto, coincidencia.start()),
                "TABLA_INEXISTENTE",
                f"La tabla `{tabla}` no existe en el esquema.{sugerencia(tabla, tablas)}",
            )
        )

    for coincidencia in PATRON_CALIFICADA.finditer(texto):
        prefijo = coincidencia.group("prefijo")
        columna = coincidencia.group("columna")
        objetivo = alias.get(prefijo) or (prefijo if prefijo in tablas else None)
        if not objetivo or prefijo.lower() in NO_ALIAS:
            continue
        if columna in allowlist or columna == "*":
            continue
        columnas = tablas[objetivo]["columnas"]
        if columna in columnas:
            continue
        equivalente = a_snake(columna)
        if PATRON_CAMEL.match(columna) and equivalente in columnas:
            hallazgos.append(
                (
                    numero_de_linea(texto, coincidencia.start()),
                    "CAMELCASE_EN_SQL",
                    f"`{prefijo}.{columna}` usa camelCase; en la base la columna es `{equivalente}`.",
                )
            )
        else:
            hallazgos.append(
                (
                    numero_de_linea(texto, coincidencia.start()),
                    "COLUMNA_INEXISTENTE",
                    f"`{objetivo}` no tiene la columna `{columna}`.{sugerencia(columna, columnas)}",
                )
            )

    for patron, etiqueta in ((PATRON_TABLENAME_PY, "__tablename__"), (PATRON_TABLENAME_JS, "tableName")):
        for coincidencia in patron.finditer(texto):
            valor = coincidencia.group("valor")
            if valor in tablas or valor in allowlist:
                continue
            hallazgos.append(
                (
                    numero_de_linea(texto, coincidencia.start()),
                    "MODELO_SIN_TABLA",
                    f"{etiqueta} = `{valor}` no corresponde a ninguna tabla.{sugerencia(valor, tablas)}",
                )
            )

    # camelCase suelto dentro de sentencias SQL (sin prefijo de tabla).
    for sentencia in re.finditer(r"\bSELECT\b.{0,2000}?\bFROM\b\s+\"?([a-zA-Z_][\w]*)", texto, re.IGNORECASE | re.DOTALL):
        tabla = sentencia.group(1)
        if tabla not in tablas:
            continue
        columnas = tablas[tabla]["columnas"]
        for palabra in re.finditer(r"\b([a-z]+[A-Z][\w]*)\b", sentencia.group(0)):
            identificador = palabra.group(1)
            if identificador in allowlist:
                continue
            if a_snake(identificador) in columnas and identificador not in columnas:
                hallazgos.append(
                    (
                        numero_de_linea(texto, sentencia.start() + palabra.start()),
                        "CAMELCASE_EN_SQL",
                        f"`{identificador}` en una consulta sobre `{tabla}`; la columna real es "
                        f"`{a_snake(identificador)}`.",
                    )
                )

    # Soft delete no filtrado. Se revisa fragmento por fragmento (una sentencia SQL a
    # la vez) para que varias consultas en el mismo archivo no se fusionen en una sola
    # y se pierdan las que no son la primera.
    for offset, fragmento in fragmentos_sql(texto_original, ruta.suffix):
        coincidencia = re.search(
            r"\bSELECT\b.*?\bFROM\b\s+\"?([a-zA-Z_][\w]*)\"?", fragmento, re.IGNORECASE | re.DOTALL
        )
        if not coincidencia:
            continue
        tabla = coincidencia.group(1)
        if tabla not in tablas or not tablas[tabla]["soft_delete"]:
            continue
        if "deleted_at" in fragmento:
            continue
        hallazgos.append(
            (
                numero_de_linea(texto_original, offset + coincidencia.start()),
                "SOFT_DELETE_SIN_FILTRO",
                f"Lectura de `{tabla}` sin filtrar `deleted_at IS NULL`.",
            )
        )

    return hallazgos


def deduplicar(hallazgos):
    """Evita reportar dos veces el mismo identificador en la misma linea.

    Un mismo `m.priceCents` puede caer en la regla de referencia calificada y en la de
    barrido de la sentencia SELECT; para el usuario es un solo problema.
    """
    vistos = set()
    unicos = []
    for linea, tipo, mensaje in sorted(hallazgos):
        # El nombre real (snake_case) es lo que identifica el problema de forma unica.
        nombres = re.findall(r"`([\w.]+)`", mensaje)
        snake = [n for n in nombres if "_" in n]
        clave = (linea, tipo, snake[-1] if snake else mensaje)
        if clave in vistos:
            continue
        vistos.add(clave)
        unicos.append((linea, tipo, mensaje))
    return unicos


def main():
    parser = argparse.ArgumentParser(description="Valida el codigo contra el esquema real.")
    parser.add_argument("--schema", default="db/contract/schema.json")
    parser.add_argument("--root", default=".")
    parser.add_argument("--allowlist", default="db/contract/schema-allowlist.txt")
    argumentos = parser.parse_args()

    tablas = cargar_esquema(argumentos.schema)
    allowlist = cargar_allowlist(argumentos.allowlist)

    total = 0
    archivos_revisados = 0
    por_tipo = {}

    for ruta in archivos_de_codigo(argumentos.root):
        try:
            texto = ruta.read_text(encoding="utf-8", errors="replace")
        except OSError as error:
            print(f"AVISO  no se pudo leer {ruta}: {error}")
            continue
        archivos_revisados += 1
        hallazgos = deduplicar(revisar_archivo(ruta, texto, tablas, allowlist))
        if not hallazgos:
            continue
        print(f"\n{ruta}")
        for linea, tipo, mensaje in hallazgos:
            print(f"  {linea}: [{tipo}] {mensaje}")
            por_tipo[tipo] = por_tipo.get(tipo, 0) + 1
            total += 1

    print(f"\nArchivos revisados: {archivos_revisados}  Tablas en contrato: {len(tablas)}")
    if total == 0:
        print("Sin hallazgos: el codigo coincide con el esquema.")
        return 0

    print(f"Hallazgos: {total}")
    for tipo, cantidad in sorted(por_tipo.items()):
        print(f"  {tipo}: {cantidad}")
    print(
        "\nCorrige el codigo al nombre real, o escribe una migracion y vuelve a ejecutar "
        "extract_schema.py. Un falso positivo se agrega a " + argumentos.allowlist + " con comentario."
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
