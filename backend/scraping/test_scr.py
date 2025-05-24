from scraping_trendo import scrape_trendo
import json

if __name__ == "__main__":
    # Test with a list of words as search terms
    search_terms = ["remera", "negra", "polo"]
    print(f"Results for: {search_terms}")
    results = scrape_trendo(search_terms, 3)
    print(json.dumps(results, ensure_ascii=False, indent=2))
    print("\n" + "-"*40 + "\n")
    print(results)
