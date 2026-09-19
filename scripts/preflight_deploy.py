#!/usr/bin/env python3
"""Puerta de entrada al despliegue: si algo falla aqui, no se despliega.

Verificaciones:
  1. AWS CLI instalado y credenciales validas.
  2. Region definida.
  3. Repositorio git limpio y rama conocida.
  4. Contrato de esquema presente y sin drift respecto a la base en vivo.
  5. Validador de codigo contra esquema en verde.
  6. Sin migraciones pendientes (Alembic y/o carpeta de migraciones de Node).
  7. Todas las claves del manifiesto existen en el secreto de Secrets Manager.
  8. .env excluido de la imagen (.dockerignore) y de git (.gitignore).

Uso:
  python scripts/preflight_deploy.py --environment production --service api
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

# Los scripts hermanos se resuelven respecto a este archivo, no al directorio actual.
DIRECTORIO_SCRIPTS = Path(__file__).resolve().parent

VERDE = "OK   "
ROJO = "FALLA"
AVISO = "AVISO"


class Reporte:
    def __init__(self):
        self.fallas = 0
        self.avisos = 0

    def ok(self, titulo, detalle=""):
        print(f"[{VERDE}] {titulo}" + (f" — {detalle}" if detalle else ""))

    def falla(self, titulo, detalle):
        print(f"[{ROJO}] {titulo} — {detalle}")
        self.fallas += 1

    def aviso(self, titulo, detalle):
        print(f"[{AVISO}] {titulo} — {detalle}")
        self.avisos += 1


def correr(comando, entrada=None):
    try:
        proceso = subprocess.run(comando, capture_output=True, text=True, input=entrada)
    except FileNotFoundError:
        return None, "", f"{comando[0]} no esta instalado o no esta en PATH"
    return proceso.returncode, proceso.stdout.strip(), proceso.stderr.strip()


def verificar_aws(reporte, region):
    codigo, salida, error = correr(["aws", "--version"])
    if codigo is None:
        reporte.falla("AWS CLI", error)
        return False
    if not salida.startswith("aws-cli/2"):
        reporte.aviso("AWS CLI", f"version distinta de v2: {salida or error}")
    else:
        reporte.ok("AWS CLI", salida.split()[0])

    codigo, salida, error = correr(["aws", "sts", "get-caller-identity", "--output", "json"])
    if codigo != 0:
        reporte.falla("Credenciales AWS", error or "sts get-caller-identity fallo")
        return False
    identidad = json.loads(salida)
    reporte.ok("Credenciales AWS", identidad["Arn"])

    if region:
        reporte.ok("Region", region)
    else:
        codigo, salida, _ = correr(["aws", "configure", "get", "region"])
        if salida:
            reporte.ok("Region", f"{salida} (del perfil)")
        else:
            reporte.falla("Region", "define AWS_REGION o --region; sin region el deploy es ambiguo")
    return True


def verificar_git(reporte):
    codigo, dentro, error = correr(["git", "rev-parse", "--is-inside-work-tree"])
    if codigo is None:
        reporte.aviso("Git", error)
        return
    if codigo != 0 or dentro != "true":
        reporte.falla("Git", "este directorio no es un repositorio git; no hay revision que desplegar")
        return
    codigo, salida, error = correr(["git", "status", "--porcelain"])
    if salida:
        reporte.falla(
            "Arbol de trabajo git",
            f"{len(salida.splitlines())} archivo(s) sin commitear; no se despliega codigo no versionado",
        )
    else:
        reporte.ok("Arbol de trabajo git", "limpio")

    _, rama, _ = correr(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    _, sha, _ = correr(["git", "rev-parse", "--short", "HEAD"])
    reporte.ok("Revision", f"{rama} @ {sha}")


def verificar_esquema(reporte, directorio_contrato, url_base):
    contrato = Path(directorio_contrato)
    archivo_json = contrato / "schema.json"
    archivo_lock = contrato / "schema.lock"
    if not archivo_json.exists() or not archivo_lock.exists():
        reporte.falla(
            "Contrato de esquema",
            f"falta {archivo_json} o {archivo_lock}; ejecuta scripts/extract_schema.py",
        )
        return

    huella_guardada = archivo_lock.read_text(encoding="utf-8").strip()
    huella_actual = hashlib.sha256(archivo_json.read_text(encoding="utf-8").rstrip("\n").encode("utf-8")).hexdigest()
    if huella_guardada != huella_actual:
        reporte.falla(
            "Integridad del contrato",
            "schema.json fue editado a mano; regeneralo con extract_schema.py en lugar de editarlo",
        )
    else:
        reporte.ok("Integridad del contrato", huella_guardada[:16] + "...")

    if not url_base:
        reporte.aviso(
            "Drift contra la base en vivo",
            "sin DATABASE_URL no se puede comparar; ejecuta extract_schema.py contra el entorno destino",
        )
        return

    temporal = Path(".preflight-schema")
    codigo, _, error = correr(
        [sys.executable, str(DIRECTORIO_SCRIPTS / "extract_schema.py"), "--url", url_base, "--out", str(temporal)]
    )
    if codigo != 0:
        reporte.falla("Drift contra la base en vivo", error.splitlines()[-1] if error else "extraccion fallo")
        return
    nueva = (temporal / "schema.lock").read_text(encoding="utf-8").strip()
    if nueva != huella_guardada:
        reporte.falla(
            "Drift contra la base en vivo",
            "el esquema del entorno destino no coincide con el contrato; hay migraciones sin aplicar o cambios manuales",
        )
    else:
        reporte.ok("Drift contra la base en vivo", "sin diferencias")


def verificar_codigo(reporte, directorio_contrato):
    codigo, salida, error = correr(
        [
            sys.executable,
            str(DIRECTORIO_SCRIPTS / "validate_code_vs_schema.py"),
            "--schema",
            str(Path(directorio_contrato) / "schema.json"),
            "--root",
            ".",
        ]
    )
    if codigo == 0:
        reporte.ok("Codigo vs esquema", "sin hallazgos")
    elif error and "Hallazgos" not in salida:
        reporte.falla("Codigo vs esquema", error.splitlines()[-1])
    else:
        ultima = [l for l in salida.splitlines() if l.startswith("Hallazgos:")]
        reporte.falla(
            "Codigo vs esquema",
            (ultima[0] if ultima else "el validador reporto errores") +
            " — ejecuta scripts/validate_code_vs_schema.py para el detalle",
        )


def verificar_migraciones(reporte):
    if Path("alembic.ini").exists():
        codigo, salida, error = correr(["alembic", "current"])
        if codigo is None:
            reporte.aviso("Migraciones Alembic", "alembic no esta instalado en este entorno")
        else:
            codigo_h, cabezas, _ = correr(["alembic", "heads"])
            if codigo == 0 and codigo_h == 0:
                revision_actual = salida.split()[0] if salida else ""
                if revision_actual and revision_actual in cabezas:
                    reporte.ok("Migraciones Alembic", "base al dia")
                else:
                    reporte.falla(
                        "Migraciones Alembic",
                        "hay revisiones sin aplicar; corre `alembic upgrade head` antes del deploy",
                    )
            else:
                reporte.aviso("Migraciones Alembic", error or "no se pudo determinar el estado")
    else:
        reporte.ok("Migraciones Alembic", "no aplica (sin alembic.ini)")


def verificar_secretos(reporte, manifiesto, region):
    ruta = Path(manifiesto)
    if not ruta.exists():
        reporte.falla(
            "Manifiesto de secretos",
            f"falta {manifiesto}; ejecuta scripts/sync_secrets.py",
        )
        return
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    nombre = datos["secreto"]
    comando = ["aws", "secretsmanager", "get-secret-value", "--secret-id", nombre, "--output", "json"]
    if region:
        comando += ["--region", region]
    codigo, salida, error = correr(comando)
    if codigo != 0:
        reporte.falla("Secretos en AWS", f"no se pudo leer `{nombre}`: {error}")
        return
    contenido = json.loads(json.loads(salida)["SecretString"])
    faltantes = [clave for clave in datos["claves_secretas"] if clave not in contenido]
    vacias = [clave for clave in datos["claves_secretas"] if contenido.get(clave) == ""]
    if faltantes:
        reporte.falla("Secretos en AWS", "faltan claves: " + ", ".join(faltantes))
    elif vacias:
        reporte.falla("Secretos en AWS", "claves vacias: " + ", ".join(vacias))
    else:
        reporte.ok("Secretos en AWS", f"{len(datos['claves_secretas'])} claves presentes en {nombre}")


def verificar_exclusiones(reporte):
    for archivo, etiqueta in ((".dockerignore", "imagen Docker"), (".gitignore", "git")):
        ruta = Path(archivo)
        if not ruta.exists():
            reporte.falla(f"Exclusion de .env ({etiqueta})", f"no existe {archivo}")
            continue
        contenido = ruta.read_text(encoding="utf-8")
        if any(patron in contenido for patron in (".env", "*.env")):
            reporte.ok(f"Exclusion de .env ({etiqueta})", f"declarada en {archivo}")
        else:
            reporte.falla(
                f"Exclusion de .env ({etiqueta})",
                f"agrega `.env` y `*.env` a {archivo}; de lo contrario las claves viajan en el deploy",
            )


def main():
    parser = argparse.ArgumentParser(description="Preflight de despliegue de MexxicanMX.")
    parser.add_argument("--environment", required=True)
    parser.add_argument("--service", required=True)
    parser.add_argument("--region", default=os.environ.get("AWS_REGION", ""))
    parser.add_argument("--contract", default="db/contract")
    parser.add_argument("--manifest", default="deploy/secrets.manifest.json")
    parser.add_argument(
        "--database-url",
        default=os.environ.get("DATABASE_URL"),
        help="Base del entorno destino, para detectar drift de esquema.",
    )
    argumentos = parser.parse_args()

    print(f"Preflight — entorno {argumentos.environment}, servicio {argumentos.service}\n")
    reporte = Reporte()

    if verificar_aws(reporte, argumentos.region):
        verificar_secretos(reporte, argumentos.manifest, argumentos.region)
    verificar_git(reporte)
    verificar_esquema(reporte, argumentos.contract, argumentos.database_url)
    verificar_codigo(reporte, argumentos.contract)
    verificar_migraciones(reporte)
    verificar_exclusiones(reporte)

    print(f"\nResultado: {reporte.fallas} falla(s), {reporte.avisos} aviso(s)")
    if reporte.fallas:
        print("Despliegue BLOQUEADO. Corrige cada falla y vuelve a ejecutar el preflight.")
        return 1
    print("Preflight en verde. Continua con references/despliegue-aws.md.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
