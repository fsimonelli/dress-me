# ============================================================================
# Intrucciones:
# Este archivo brindara la funcion:'
# busqueda_zara_keywords'(cant, kwars);
# Que en caso de ser llamada sin argumentos devolvera los 10 primeros elementos Best Sellers Zara: "https://www.zara.com/uy/es/hombre-basicos-l587.html?v1=2547017"
# En caso de traer cant = n, n sera la cantidad de elementos a traer
# En caso de tenes kwars, este sera un conjunto de keywords, por lo que el escraping se realizara en el serch de Zara: "https://www.zara.com/uy/es/search?searchTerm=" 
# Donde las keywors seran sumadas al link
# Ejemplo de con ['remera';'roja';'larga'] el url resulta : "https://www.zara.com/uy/es/search?searchTerm=%27remera%27%20%27roja%27%20%27larga%27"
# ============================================================================
# Uso:
# Por medio de consola:
# python webir_scraping.py negro pantalon --cant 5
# Por codigo:
# items = busqueda_zara_keywords(cant=5, kwars=['negro','pantalon'])
# ============================================================================



from selenium import webdriver  # Para automatizar el navegador
from selenium.webdriver.common.by import By  # Para localizar elementos en la página
from selenium.webdriver.chrome.options import Options  # Para configurar opciones de Chrome
from selenium.webdriver.chrome.service import Service  # Para el servicio de Chrome
from webdriver_manager.chrome import ChromeDriverManager  # Para manejar el driver de Chrome
from selenium.webdriver.support.ui import WebDriverWait  # Para esperar a que elementos estén presentes
from selenium.webdriver.support import expected_conditions as EC  # Para condiciones de espera
from selenium.common.exceptions import TimeoutException  # Para manejar excepciones
import time  # Para pausas y esperas
import urllib.parse  # Para codificar parámetros en URL


def busqueda_zara_keywords(cant=10, kwars=None):
    """
    Realiza scraping de Zara Uruguay. Si kwars es None, obtiene los Best Sellers de hombre ("hombre-basicos").
    En caso contrario construye la búsqueda con las keywords proporcionadas.
    Devuelve una lista de diccionarios con los campos: name, price, original_price, discount, url, image_url.
    """
    # Construir URL según parámetros
    if kwars:
        # Agregar comillas simples a cada keyword y unir con espacios
        quoted = [f"'{kw}'" for kw in kwars]
        search_term = " ".join(quoted)
        # Codificar para URL
        encoded = urllib.parse.quote(search_term)
        url = f"https://www.zara.com/uy/es/search?searchTerm={encoded}"
    else:
        url = "https://www.zara.com/uy/es/hombre-basicos-l587.html?v1=2547017"

    # Configuración de Chrome en headless
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument(
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    # Inicializar driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    try:
        # Abrir URL y esperar carga inicial
        driver.get(url)
        time.sleep(5)

        # Scroll para cargar todo el contenido dinámico
        last_height = driver.execute_script("return document.body.scrollHeight")
        for _ in range(5):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

        # Esperar a que al menos un producto aparezca
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "li.product-grid-product"))
        )

        # Recopilar tarjetas y limitar a 'cant'
        cards = driver.find_elements(By.CSS_SELECTOR, "li.product-grid-product")
        cards = cards[:min(cant, len(cards))]

        items = []
        for card in cards:
            # Nombre
            try:
                name_el = WebDriverWait(card, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "a.product-link"))
                )
                name = name_el.get_attribute("title")
            except TimeoutException:
                name = None

            # Precio actual
            try:
                price_el = card.find_element(By.CSS_SELECTOR, "span.price-current__amount")
                price = price_el.text
            except Exception:
                price = None

            # Precio original
            try:
                orig_el = card.find_element(By.CSS_SELECTOR, "span.price-old__amount")
                original_price = orig_el.text
            except Exception:
                original_price = None

            # Descuento
            try:
                disc_el = card.find_element(By.CSS_SELECTOR, "span.price-current__discount")
                discount = disc_el.text
            except Exception:
                discount = None

            # Enlace
            url_item = name_el.get_attribute("href") if name_el else None

            # Imagen
            try:
                img_el = card.find_element(By.TAG_NAME, "img")
                image_url = img_el.get_attribute("src")
            except Exception:
                image_url = None

            # Agregar diccionario
            items.append({
                "name": name,
                "price": price,
                "original_price": original_price,
                "discount": discount,
                "url": url_item,
                "image_url": image_url
            })

        return items
    finally:
        driver.quit()


if __name__ == "__main__":
    import argparse, json

    parser = argparse.ArgumentParser(description="Scraping de Zara Uruguay por palabras clave")
    parser.add_argument("keywords", nargs="+", help="Lista de palabras clave para buscar")
    parser.add_argument("-n", "--cant", type=int, default=10, help="Número de ítems a extraer")
    args = parser.parse_args()

    resultados = busqueda_zara_keywords(cant=args.cant, kwars=args.keywords)
    print(json.dumps(resultados, ensure_ascii=False, indent=2))

