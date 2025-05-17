from backend.database.queries.get_selected_items import get_selected_items
from queries.update_batch import update_batch
from openai import OpenAI, RateLimitError
import base64
from dotenv import load_dotenv
import os
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

items = get_selected_items(processed=False)
batch = []

for i, item in enumerate(items):
    try:
        image = open(f"data/images/{item['outfit_id']}/{item['item_idx']}.jpg", "rb").read()
        base64_image = base64.b64encode(image).decode("utf-8")

        description = get_description(item, base64_image)
        item['description'] = description
        batch.append(item)
        
        if i % 10 == 0:
            update_batch(batch)
            batch = []
            print(f"Processed {i} items, saved to database.")
                
        print(f"Processed item {item['outfit_id']}/{item['item_idx']}")
        
    except Exception as e:
        print(f"Error processing item {item['outfit_id']}/{item['item_idx']}, Error: {e}")
        continue
    
    except RateLimitError as e:
        print(f"Rate limit error for item {item['outfit_id']}/{item['item_idx']}, Error: {e}")
        continue
    
        