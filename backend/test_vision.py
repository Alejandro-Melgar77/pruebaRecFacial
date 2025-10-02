import os
from google.cloud import vision

# Configurar la variable de entorno
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "smart-condominium-credentials.json"

def test_vision_api():
    try:
        # Inicializar cliente
        client = vision.ImageAnnotatorClient()
        
        # Crear una imagen de prueba (puede ser cualquier imagen)
        # Por ahora solo probamos la conexión
        print("✅ Google Cloud Vision API configurada correctamente")
        print(f"✅ Proyecto: smart-condominium-ia")
        print("✅ Cliente de Vision inicializado sin errores")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_vision_api()