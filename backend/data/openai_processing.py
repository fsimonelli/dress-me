from openai import OpenAI, RateLimitError
import base64
from dotenv import load_dotenv
import os
import json
from tenacity import (
    retry,
    stop_after_attempt,
    wait_random_exponential,
)

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def get_description(item, base64_image):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "With the keywords as a baseline, describe the item shown in the image, minimizing the use of stopwords. Do it in a single line, with no special characters. Describe its color, pattern, material, type, and any other relevant details.",
                    },
                    {
                        "type": "text",
                        "text": item['keywords'],
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
    )
    return response.choices[0].message.content

with open("polyvore_data/items.json") as f:
    items = json.load(f)
    
for i, item in enumerate(items):
    try:
        if (item['description']):
            continue
        
        image = open(f"polyvore_data/images/{item['id']}.jpg", "rb").read()
        base64_image = base64.b64encode(image).decode("utf-8")

        description = get_description(item, base64_image)
        item['description'] = description
        
        if i % 10 == 0:
            with open('polyvore_data/items.json', 'w') as f:
                json.dump(items, f, indent=4)
            print(f"Processed {i} items, saved to file.")
                
        print(f"Processed item {item['id']}")
        
    except Exception as e:
        print(f"Error processing item {item['id']}, Error: {e}")
        continue
    
    except RateLimitError as e:
        print(f"Rate limit error for item {item['id']}, Error: {e}")
        continue
    
with open('polyvore_data/items.json', 'w') as f:
    json.dump(items, f, indent=4)
        