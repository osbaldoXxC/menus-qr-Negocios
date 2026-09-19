#!/usr/bin/env python3
"""Migra las credenciales de un archivo .env a AWS Secrets Manager.

Comportamiento:
  - Clasifica cada clave como secreta o como configuracion publica.
  - Sube SOLO las secretas, como un unico secreto JSON por entorno y servicio:
        mexxicanmx/<environment>/<service>
  - Nunca imprime valores: solo nombres de clave y longitud.
  - Pasa el contenido por archivo temporal con permisos 0600, no por argumento de CLI
    (los argumentos son visibles en la lista de procesos de la maquina).
  - Verifica que el .env este ignorado por git y avisa si esta versionado.
  - Genera deploy/secrets.manifest.json y el bloque `secrets` para la task definition.

Uso:
  python scripts/sync_secrets.py --env-file .env --environment production --service api --dry-run
  python scripts/sync_secrets.py --env-file .env --environment production --service api
"""

import argparse
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
from pathlib import Path

# Fragmentos que marcan una clave como secreta. Conservador a proposito: ante la duda,
# la clave se trata como secreta y se sube cifrada.
FRAGMENTOS_SECRETOS = (
    "secret", "password", "passwd", "token", "key", "credential", "private",
    "dsn", "database_url", "db_url", "redis_url", "connection_string", "auth",
    "signature", "salt", "cert", "webhook", "api_key", "access", "session",
)

# Claves que parecen secretas por el patron anterior pero son configuracion publica.
EXCEPCIONES_PUBLICAS = {
    "ACCESS_TOKEN_TTL", "ACCESS_TOKEN_EXPIRES_IN", "AUTH_COOKIE_NAME",
    "KEY_ROTATION_DAYS", "SESSION_COOKIE_SECURE",
}

PATRON_LINEA_ENV = re.compile(r"^\s*(?:export\s+)?(?P<clave>[A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?P<valor>.*)$")


def leer_env(ruta):
    archivo = Path(ruta)
    if not archivo.exists():
        sys.exit(f"No existe {ruta}. Indica la ruta correcta con --env-file.")
    pares = {}
    for numero, linea in enumerate(archivo.read_text(encoding="utf-8").splitlines(), start=1):
        if not linea.strip() or linea.lstrip().startswith("#"):
            continue
        coincidencia = PATRON_LINEA_ENV.match(linea)
        if not coincidencia:
            print(f"AVISO  {ruta}:{numero} no tiene formato CLAVE=valor; se ignora.")
            continue
        valor = coincidencia.group("valor").strip()
        if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in "\"'":
            valor = valor[1:-1]
        pares[coincidencia.group("clave")] = valor
    if not pares:
        sys.exit(f"{ruta} no contiene variables utilizables.")
    return pares


def es_secreta(clave):
    if clave in EXCEPCIONES_PUBLICAS:
        return False
    minuscula = clave.lower()
    return any(fragmento in minuscula for fragmento in FRAGMENTOS_SECRETOS)


def ejecutar_aws(argumentos, entrada_json=None):
    """Ejecuta AWS CLI. Devuelve (codigo, stdout, stderr) sin lanzar excepcion."""
    try:
        proceso = subprocess.run(
            ["aws"] + argumentos,
            capture_output=True,
            text=True,
            input=entrada_json,
        )
    except FileNotFoundError:
        sys.exit(
            "AWS CLI no esta instalado o no esta en PATH.\n"
            "Instala AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
        )
    return proceso.returncode, proceso.stdout.strip(), proceso.stderr.strip()


def verificar_identidad():
    codigo, salida, error = ejecutar_aws(["sts", "get-caller-identity", "--output", "json"])
    if codigo != 0:
        sys.exit(
            "No hay credenciales de AWS validas en esta sesion.\n"
            f"  {error}\n"
            "Configura un perfil con: aws configure --profile mexxicanmx"
        )
    identidad = json.loads(salida)
    print(f"Cuenta AWS: {identidad['Account']}  Identidad: {identidad['Arn']}")


def verificar_git(ruta_env):
    codigo, salida, _ = ejecutar_git(["check-ignore", str(ruta_env)])
    if codigo != 0:
        print(f"AVISO  {ruta_env} NO esta en .gitignore. Agregalo antes de continuar.")
    codigo, salida, _ = ejecutar_git(["ls-files", "--error-unmatch", str(ruta_env)])
    if codigo == 0:
        print(
            f"ALERTA  {ruta_env} esta versionado en git. Las claves ya estan en el historial: "
            "deben rotarse, no solo eliminarse. Ver references/secrets-manager.md."
        )


def ejecutar_git(argumentos):
    try:
        proceso = subprocess.run(["git"] + argumentos, capture_output=True, text=True)
    except FileNotFoundError:
        return 1, "", "git no disponible"
    return proceso.returncode, proceso.stdout.strip(), proceso.stderr.strip()


def escribir_temporal(contenido):
    """Escribe el JSON del secreto en un archivo temporal solo legible por el usuario."""
    descriptor, ruta = tempfile.mkstemp(prefix="mexxicanmx-secret-", suffix=".json")
    os.close(descriptor)
    archivo = Path(ruta)
    archivo.write_text(contenido, encoding="utf-8")
    archivo.chmod(stat.S_IRUSR | stat.S_IWUSR)
    return archivo


def sincronizar(nombre, secretos, region, etiquetas):
    contenido = json.dumps(secretos, indent=2, sort_keys=True)
    temporal = escribir_temporal(contenido)
    try:
        base = ["secretsmanager", "--region", region] if region else ["secretsmanager"]
        codigo, _, _ = ejecutar_aws(base + ["describe-secret", "--secret-id", nombre])
        if codigo == 0:
            codigo, _, error = ejecutar_aws(
                base + ["put-secret-value", "--secret-id", nombre, "--secret-string", f"file://{temporal}"]
            )
            accion = "actualizado"
        else:
            comando = base + [
                "create-secret",
                "--name", nombre,
                "--description", "Credenciales de MexxicanMX gestionadas por sync_secrets.py",
                "--secret-string", f"file://{temporal}",
            ]
            for clave, valor in etiquetas.items():
                comando += ["--tags", f"Key={clave},Value={valor}"]
            codigo, _, error = ejecutar_aws(comando)
            accion = "creado"
        if codigo != 0:
            sys.exit(f"Fallo al escribir el secreto `{nombre}`:\n  {error}")
        print(f"Secreto {accion}: {nombre} ({len(secretos)} claves)")
    finally:
        temporal.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description="Migra .env a AWS Secrets Manager.")
    parser.add_argument("--env-file", default=".env")
    parser.add_argument("--environment", required=True, help="production, staging, dev")
    parser.add_argument("--service", required=True, help="api, ai-engine, web")
    parser.add_argument("--region", default=os.environ.get("AWS_REGION", ""))
    parser.add_argument("--manifest", default="deploy/secrets.manifest.json")
    parser.add_argument("--dry-run", action="store_true", help="No escribe nada en AWS.")
    argumentos = parser.parse_args()

    pares = leer_env(argumentos.env_file)
    secretos = {clave: valor for clave, valor in pares.items() if es_secreta(clave)}
    publicas = {clave: valor for clave, valor in pares.items() if not es_secreta(clave)}

    vacias = [clave for clave, valor in secretos.items() if not valor]
    if vacias:
        sys.exit(
            "Estas claves secretas estan vacias en el .env: " + ", ".join(sorted(vacias)) +
            "\nCompletalas o eliminalas antes de sincronizar."
        )

    nombre_secreto = f"mexxicanmx/{argumentos.environment}/{argumentos.service}"

    print(f"\nSecreto destino: {nombre_secreto}")
    print("\nClaves clasificadas como SECRETAS (se cifran en AWS):")
    for clave in sorted(secretos):
        print(f"  {clave}  ({len(secretos[clave])} caracteres)")
    print("\nClaves clasificadas como CONFIGURACION (van como variables planas):")
    for clave in sorted(publicas):
        print(f"  {clave} = {publicas[clave]}")

    verificar_git(argumentos.env_file)

    manifiesto = {
        "secreto": nombre_secreto,
        "environment": argumentos.environment,
        "service": argumentos.service,
        "claves_secretas": sorted(secretos),
        "claves_configuracion": sorted(publicas),
    }
    ruta_manifiesto = Path(argumentos.manifest)
    bloque_ecs = [
        {
            "name": clave,
            "valueFrom": f"arn:aws:secretsmanager:REGION:CUENTA:secret:{nombre_secreto}:{clave}::",
        }
        for clave in sorted(secretos)
    ]

    if argumentos.dry_run:
        print("\n--dry-run: no se escribio nada en AWS ni en disco.")
        print("Bloque `secrets` para la task definition de ECS:")
        print(json.dumps(bloque_ecs, indent=2))
        return

    if not argumentos.region:
        print(
            "AVISO  sin --region ni AWS_REGION: se usara la region del perfil activo de AWS CLI."
        )

    verificar_identidad()
    sincronizar(nombre_secreto, secretos, argumentos.region, {
        "Project": "MexxicanMX",
        "Environment": argumentos.environment,
        "Service": argumentos.service,
        "ManagedBy": "sync_secrets.py",
    })

    ruta_manifiesto.parent.mkdir(parents=True, exist_ok=True)
    ruta_manifiesto.write_text(
        json.dumps(manifiesto, indent=2, ensure_ascii=False, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Manifiesto escrito en {ruta_manifiesto} (solo nombres de clave, sin valores).")
    print("\nBloque `secrets` para la task definition de ECS:")
    print(json.dumps(bloque_ecs, indent=2))
    print(
        "\nSiguiente paso: rota cualquier clave que haya estado en un .env versionado y "
        "elimina el .env de la imagen (.dockerignore)."
    )


if __name__ == "__main__":
    main()
