from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import ImageEmbedding
from backend.services.image_service import get_image_path
from backend.database.queries.get_all_items import get_all_items
import asyncio
from PIL import Image
from tenacity import retry, stop_after_attempt, wait_fixed
import logging


BATCH_SIZE = 500
collection_name="item-image-embeddings"
logging.basicConfig(filename="image_embeddings.log", level=logging.INFO)
logger = logging.getLogger(__name__)


embedding_model = ImageEmbedding(model_name="Qdrant/clip-ViT-B-32-vision")

load_dotenv()

qdrant_client = QdrantClient(
    url="https://b5d753b8-7fcf-42c5-bf00-28480703e09e.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY"),
)

def log_attempt_number(retry_state):
    """return the result of the last call attempt"""
    logging.error(f"Retrying: {retry_state.attempt_number}...")

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2), after=log_attempt_number)
async def create_embedding(item):
    image_path = await get_image_path(item['outfit_id'], item['item_idx'])
    image = Image.open(image_path).convert("RGB")

    embedding = list(embedding_model.embed([image]))[0]
    return embedding

async def main():
    logger.info("Started")
    items = get_all_items()
    i = 0
    points = []
    if not qdrant_client.collection_exists(collection_name):
        image_embeddings_size = embedding_model._get_model_description("Qdrant/clip-ViT-B-32-vision").dim
        qdrant_client.create_collection(
                        collection_name="item-image-embeddings",
                        vectors_config=VectorParams(size=image_embeddings_size,distance=Distance.COSINE),
                    )
        
    for item in items:
        try:
            embedding = await create_embedding(item)
            point = PointStruct(
                id=int(str(item['outfit_id']) + str(item['item_idx'])),
                vector=embedding,
                payload={
                    "outfit_id": item['outfit_id'],
                    "item_idx": item['item_idx'],
                    "keywords": item['keywords'],
                    "category": item['category'],
                },
            )

            points.append(point)
            i += 1
            
            if (i % BATCH_SIZE == 0):
                qdrant_client.upsert(collection_name, points=points)
                logger.info(f"Inserted {i} items into Qdrant")
                points = []
        except Exception as e:
            logger.error(f"Error processing item {item['outfit_id']}/{item['item_idx']}: {e}")
            continue
        
    if points:
        qdrant_client.upsert(collection_name, points=points)
        logger.info(f"Inserted {i} items into Qdrant")

if __name__ == "__main__":
    asyncio.run(main())