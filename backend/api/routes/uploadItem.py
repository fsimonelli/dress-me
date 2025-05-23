from fastapi import APIRouter, UploadFile
from openai import OpenAI
import base64
from dotenv import load_dotenv
import os
import core.qdrant.query as qdrant_query
from database.queries.get_complementing_items import get_complementing_items
from core.qdrant.fastembed_models import image_embedding_model, text_embedding_model
from PIL import Image

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.post("/")
async def upload_item(file: UploadFile):
    image = Image.open(file.file).convert("RGB")
    embedding = list(image_embedding_model.embed([image]))[0]
    suggestions = qdrant_query.get_items_by_image_embedding(embedding)
    [outfit_id, item_idx] = [
        suggestions.points[0].payload["outfit_id"],
        suggestions.points[0].payload["item_idx"],
    ]

    res = get_complementing_items(outfit_id, item_idx)
    return [res, suggestions]

@router.post("/openai")
async def upload_item(file: UploadFile):
    readFile = await file.read()
    base64_image = base64.b64encode(readFile).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Describe the item shown in the image, minimizing the use of stopwords. Do it in a single line, with no special characters. Describe its color, pattern, material, type, and any other relevant details.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
    )
    description = response.choices[0].message.content
    embedding = list(text_embedding_model.embed([description]))
    suggestions = qdrant_query.get_items_by_text_embedding(embedding)
    [outfit_id, item_idx] = [
        suggestions.points[0].payload["outfit_id"],
        suggestions.points[0].payload["item_idx"],
    ]

    res = get_complementing_items(outfit_id, item_idx)
    return [res, suggestions]
