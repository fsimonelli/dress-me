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

