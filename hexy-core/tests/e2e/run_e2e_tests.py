#!/usr/bin/env python3
"""
Script para ejecutar tests E2E del dashboard
"""
import subprocess
import sys
import time
import requests
from pathlib import Path


def check_dashboard_availability(base_url: str, max_retries: int = 30) -> bool:
    """Verificar si el dashboard está disponible"""
    print(f"🔍 Verificando disponibilidad del dashboard en {base_url}")

    for i in range(max_retries):
        try:
            response = requests.get(base_url, timeout=5)
            if response.status_code == 200:
                print("✅ Dashboard disponible")
                return True
        except requests.RequestException:
            pass

        print(f"⏳ Intento {i+1}/{max_retries} - Esperando...")
        time.sleep(2)

    print("❌ Dashboard no disponible después de múltiples intentos")
    return False


def run_e2e_tests(base_url: str = "http://localhost:3000"):
    """Ejecutar tests E2E"""
    print("🚀 Iniciando tests E2E para el dashboard Hexy")

    # Verificar disponibilidad
    if not check_dashboard_availability(base_url):
        print("❌ No se puede ejecutar tests E2E - Dashboard no disponible")
        print("💡 Asegúrate de que el dashboard esté ejecutándose en el puerto 3000")
        return False

    # Ejecutar tests
    print("🧪 Ejecutando tests E2E...")

    try:
        result = subprocess.run(
            [
                "python",
                "-m",
                "pytest",
                "tests/e2e/",
                "-v",
                "--base-url",
                base_url,
                "--headed",  # Ejecutar con navegador visible
                "--slowmo",
                "1000",  # Pausa entre acciones
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            print("✅ Tests E2E completados exitosamente")
            print(result.stdout)
            return True
        else:
            print("❌ Tests E2E fallaron")
            print(result.stdout)
            print(result.stderr)
            return False

    except Exception as e:
        print(f"❌ Error ejecutando tests E2E: {e}")
        return False


def main():
    """Función principal"""
    print("=" * 60)
    print("🧪 VALIDACIÓN E2E DEL DASHBOARD HEXY")
    print("=" * 60)

    # Verificar que estamos en el directorio correcto
    if not Path("tests/e2e/").exists():
        print("❌ No se encontró el directorio tests/e2e/")
        print("💡 Ejecuta este script desde el directorio raíz del proyecto")
        sys.exit(1)

    # Ejecutar tests
    success = run_e2e_tests()

    if success:
        print("\n🎉 ¡Validación E2E completada exitosamente!")
        print("📊 El dashboard está completamente funcional")
    else:
        print("\n❌ Validación E2E falló")
        print("🔧 Revisa los logs para más detalles")
        sys.exit(1)


if __name__ == "__main__":
    main()
