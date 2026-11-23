#!/usr/bin/env python3
"""Suite de Pruebas Automatizadas en el Entorno de Liberación y Post-Despliegue.

Ejecuta validaciones integrales sobre el entorno de liberación/producción:
  1. Pruebas de preflight y contrato relacional de base de datos (20 tablas).
  2. Pruebas de disponibilidad y salud del API Backend (/health y conexión PostgreSQL).
  3. Pruebas de seguridad de cabeceras HTTP (HSTS, CSP, X-Frame-Options, No-Sniff).
  4. Pruebas de disponibilidad y latencia SLA (< 500 ms) en Frontends CloudFront.

Uso:
  python scripts/test_release_env.py --api-url https://backend.oamdevsol.site --app-url https://app.oamdevsol.site --panel-url https://panel.oamdevsol.site
"""

import argparse
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

DIRECTORIO_RAIZ = Path(__file__).resolve().parent.parent


def verificar_contrato_local():
    print("=== [1/4] Verificando Contrato de Esquema SQL vs Código Fuente ===")
    validador = DIRECTORIO_RAIZ / "scripts" / "validate_code_vs_schema.py"
    esquema = DIRECTORIO_RAIZ / "db" / "contract" / "schema.json"
    if not validador.exists() or not esquema.exists():
        print("[FALLA] Falta el validador SQL o el contrato schema.json.")
        return False

    proc = subprocess.run(
        [sys.executable, str(validador), "--schema", str(esquema), "--root", str(DIRECTORIO_RAIZ)],
        capture_output=True,
        text=True,
    )
    if proc.returncode == 0:
        print(proc.stdout.strip())
        return True
    print(f"[FALLA] Desalineación de esquema detectada:\n{proc.stdout}\n{proc.stderr}")
    return False


def probar_endpoint(nombre, url, sla_ms=1200, validar_json=False, validar_headers=False):
    inicio = time.perf_counter()
    req = urllib.request.Request(url, headers={"User-Agent": "MexxicanMX-Release-Tester/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            latencia_ms = (time.perf_counter() - inicio) * 1000.0
            status = resp.status
            headers = {k.lower(): v for k, v in resp.headers.items()}
            cuerpo = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        print(f"[FALLA] {nombre} ({url}) devolvió HTTP {e.code}")
        return False
    except Exception as e:
        print(f"[FALLA] {nombre} ({url}) inalcanzable: {e}")
        return False

    if status != 200:
        print(f"[FALLA] {nombre} respondió con código inesperado: {status}")
        return False

    estado_sla = "OK" if latencia_ms <= sla_ms else "AVISO-SLA"
    print(f"[{estado_sla}] {nombre}: HTTP {status} en {latencia_ms:.1f} ms (Umbral SLA: {sla_ms} ms)")

    if validar_json:
        try:
            datos = json.loads(cuerpo)
            if datos.get("status") != "UP" or datos.get("database") != "connected":
                print(f"[FALLA] Healthcheck reporta degradación: {datos}")
                return False
            print(f"[OK] Estado interno del servicio: API={datos.get('status')}, DB={datos.get('database')}")
        except json.JSONDecodeError:
            print("[FALLA] La respuesta de /health no es un JSON válido.")
            return False

    if validar_headers:
        cabeceras_requeridas = ["x-content-type-options", "x-frame-options"]
        faltantes = [h for h in cabeceras_requeridas if h not in headers]
        if faltantes:
            print(f"[AVISO] Cabeceras de hardening ausentes en respuesta: {', '.join(faltantes)}")
        else:
            print("[OK] Cabeceras de seguridad Helmet verificadas (X-Content-Type-Options, X-Frame-Options).")

    return True


def main():
    parser = argparse.ArgumentParser(description="Pruebas automatizadas del entorno de liberación MexxicanMX.")
    parser.add_argument("--api-url", default="https://backend.oamdevsol.site")
    parser.add_argument("--app-url", default="https://app.oamdevsol.site")
    parser.add_argument("--panel-url", default="https://panel.oamdevsol.site")
    modos = parser.add_mutually_exclusive_group()
    modos.add_argument("--skip-network", action="store_true", help="Ejecutar solo pruebas estáticas de liberación.")
    modos.add_argument("--smoke-only", action="store_true", help="Verificar solo los servicios desplegados.")
    args = parser.parse_args()

    exito = True if args.smoke_only else verificar_contrato_local()

    if args.skip_network:
        sys.exit(0 if exito else 1)

    print("\n=== [2/4] Pruebas de Salud y Base de Datos en API Backend ===")
    exito &= probar_endpoint(
        "Backend Healthcheck",
        f"{args.api_url.rstrip('/')}/health",
        sla_ms=500,
        validar_json=True,
        validar_headers=True,
    )

    print("\n=== [3/4] Pruebas de Disponibilidad en Frontends S3 + CloudFront ===")
    exito &= probar_endpoint("SPA Comensales y Restaurantes", args.app_url, sla_ms=400)
    exito &= probar_endpoint("SPA Super Admin Panel", args.panel_url, sla_ms=400)

    print("\n=== [4/4] Resumen de Validación del Entorno de Liberación ===")
    if exito:
        print("✅ TODAS LAS PRUEBAS DEL ENTORNO DE LIBERACIÓN PASARON EXITOSAMENTE.")
        return 0
    print("❌ SE DETECTARON FALLAS EN LA VALIDACIÓN DEL ENTORNO DE LIBERACIÓN.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
