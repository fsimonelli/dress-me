# =========================================================================
# Necessary imports for web scraping
# =========================================================================
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
import urllib.parse
from fastapi import APIRouter, Query
from typing import Union, List

# =========================================================================
# Initial configuration
# =========================================================================
max_products = 10  # Maximum number of products to extract

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

router = APIRouter()

# =========================================================================
# Main scraping function
# =========================================================================
def scrap_trendo(search_terms, n: int = 10):
    """
    Scrapes trendo.uy and returns a dictionary with the first n products found.
    Args:
        search_terms (Union[str, List[str]]): Search keywords as a string or a list of words.
        n (int): Maximum number of products to extract.
    Returns:
        dict: Dictionary with the found products.
    """
    # If search_terms is a list, join with spaces
    if isinstance(search_terms, list):
        search_terms = " ".join(search_terms)

    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    except Exception as e:
        print(f"Error initializing Chrome: {str(e)}")
        return {}

    try:
        search_url = "https://trendo.uy/buscar?q=" + urllib.parse.quote(search_terms)
        driver.get(search_url)
        time.sleep(5)

        last_height = driver.execute_script("return document.body.scrollHeight")
        scroll_attempts = 0
        max_attempts = 5
        while scroll_attempts < max_attempts:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
            scroll_attempts += 1

        try:
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.grid > div.relative"))
            )
        except TimeoutException:
            print("Timeout waiting for products")
            driver.quit()
            return {}

        cards = driver.find_elements(By.CSS_SELECTOR, "div.grid > div.relative")
        total_cards = len(cards)
        cards = cards[:min(n, total_cards)]

        items = []
        for i, card in enumerate(cards, 1):
            try:
                # Extract product link
                link = card.find_element(By.TAG_NAME, "a").get_attribute("href")
                # Extract image URL and alt (description)
                img = card.find_element(By.TAG_NAME, "img")
                image_url = img.get_attribute("src")
                image_alt = img.get_attribute("alt")
                # Extract discount if exists
                try:
                    discount = card.find_element(By.CSS_SELECTOR, "div.bg-red-600").text
                except NoSuchElementException:
                    discount = None
                # Extract brand
                try:
                    brand = card.find_element(By.CSS_SELECTOR, "span.text-xs.font-normal").text
                except NoSuchElementException:
                    brand = None
                # Extract name/title
                try:
                    title = card.find_element(By.TAG_NAME, "h2").text
                except NoSuchElementException:
                    title = None
                # Extract store
                try:
                    store = card.find_element(By.CSS_SELECTOR, "span.font-semibold").text
                except NoSuchElementException:
                    store = None
                # Extract prices
                try:
                    price_old = card.find_element(By.CSS_SELECTOR, "p.line-through").text
                except NoSuchElementException:
                    price_old = None
                try:
                    price = card.find_elements(By.TAG_NAME, "p")[-1].text
                except Exception:
                    price = None
                item = {
                    "title": title,
                    "brand": brand,
                    "store": store,
                    "price": price,
                    "price_old": price_old,
                    "discount": discount,
                    "link": link,
                    "image_url": image_url,
                    "image_alt": image_alt
                }
                items.append(item)
            except Exception as e:
                print(f"Error processing product {i}: {str(e)}")
                continue
        return {"results": items}
    finally:
        driver.quit()

@router.get("/scrap")
def scrap_endpoint(search_terms: Union[str, List[str]] = Query(..., description="Palabras clave de búsqueda"), n: int = 10):
    """
    Endpoint para scrapear productos de trendo.uy
    """
    return scrap_trendo(search_terms, n)

# =========================================================================
# Script direct execution
# =========================================================================
if __name__ == "__main__":
    search_terms = input("Enter search keywords: ")
    try:
        n = int(input("Enter the number of products to extract: "))
    except Exception:
        n = 10
    results = scrap_trendo(search_terms, n)
    print(json.dumps(results, ensure_ascii=False, indent=2))
