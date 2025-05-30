import argparse
import time

def run_use_case(input_data):
    print("🔍 Evaluando condición de la regla 'MaxFreeTrialsPerMonth'...")
    if input_data.get('trialsThisMonth', 0) > 3:
        print("❌ Regla no cumplida: El cliente excede las pruebas gratuitas permitidas.")
        return
    print("✅ Regla cumplida.")

    print("\n📖 Narrative:")
    print("  Asegurar que toda regla operativa esté respaldada por una narrativa clara,")
    print("  aprobada por la autoridad correspondiente, y trazable en su intención original.")

    print("\n📤 Enviando señal a autoridad (Felipe)...")
    time.sleep(1.5)
    print("📨 Signal enviado: 'NotificarAprobador' → Felipe")

    print("\n🧾 Felipe revisa la regla y aprueba.")
    time.sleep(1.5)
    print("✅ Outcome: 'ReglaAprobada' emitido a las 12:15 PM")

    print("\n📊 KPI: tiempoAprobacionRegla = 2.25 horas (simulado)")
    print("✅ Flujo completado con éxito.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HEXY MVP CLI - Aprobación de reglas operativas")
    parser.add_argument('--trialsThisMonth', type=int, default=0, help='Número de pruebas gratuitas solicitadas este mes')
    args = parser.parse_args()

    input_data = {
        'trialsThisMonth': args.trialsThisMonth
    }
    run_use_case(input_data)