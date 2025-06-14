# =========================================================================
# Necessary imports for web scraping
# =========================================================================
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, Form
from openai import OpenAI
import base64
from dotenv import load_dotenv
import os
from scraping.scraping_trendo import scrape_trendo


load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter()

@router.post("/scrap")
async def scrap_endpoint(file: UploadFile, category: str = Form(...), n: int = 10):
    """
    Endpoint para scrapear productos de trendo.uy basado en una imagen subida
    """
    # Leer la imagen y convertirla a base64
    readFile = await file.read()
    base64_image = base64.b64encode(readFile).decode("utf-8")
    
    # Usar OpenAI para generar términos de búsqueda basados en la imagen
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Analiza esta imagen de ropa de categoría '{category}' y genera exactamente 4 palabras en español para buscar productos similares. Incluye: tipo de prenda, color principal, material y estilo. Ejemplo: 'sueter azul algodon casual'. Solo devuelve las 4 palabras separadas por espacios, sin puntuación ni palabras adicionales. Usa vocabulario uruguayo: pantalón de jean=vaquero, sudadera con capucha=canguro, sudadera sin capucha=buzo, camiseta=remera, vestido de baño=enteriza, malla de dos piezas=bikini, pantalón corto=short/bermuda, zapatillas deportivas=championes, chanclas=ojotas, calcetines=medias, pantimedias=cancanes, abrigo=campera/tapado, chaqueta=campera, pulover=buzo."
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }
        ]
    )
    
    # Extraer los términos de búsqueda generados por OpenAI
    search_terms = response.choices[0].message.content.strip()
    
    # Realizar el scraping con los términos generados en un thread separado
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        result = await loop.run_in_executor(executor, scrape_trendo, search_terms, n)
    
    return result

# =========================================================================
# Script direct execution
# =========================================================================
if __name__ == "__main__":
    search_terms = input("Enter search keywords: ")
    try:
        n = int(input("Enter the number of products to extract: "))
    except Exception:
        n = 10
    results = scrape_trendo(search_terms, n)
    print(json.dumps(results, ensure_ascii=False, indent=2))
