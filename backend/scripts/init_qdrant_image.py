from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os
from qdrant_client.models import Distance, VectorParams, PointStruct
from backend.core.qdrant.fastembed_models import image_embedding_model
from backend.services.image_service import get_image_path
from backend.database.queries.get_all_items import get_all_items
import asyncio
from PIL import Image
from tenacity import retry, wait_exponential
import logging


BATCH_SIZE = 500
collection_name = "item-image-embeddings"
logging.basicConfig(filename="image_embeddings.log", level=logging.INFO)
logger = logging.getLogger(__name__)


load_dotenv()

qdrant_client = QdrantClient(
    url="https://b5d753b8-7fcf-42c5-bf00-28480703e09e.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY"),
)


def log_attempt_number(retry_state):
    """return the result of the last call attempt"""
    logging.error(f"Retrying: {retry_state.attempt_number}...")


@retry(wait=wait_exponential(multiplier=1, min=2, max=10), after=log_attempt_number)
async def create_embedding(item):
    image_path = await get_image_path(item["outfit_id"], item["item_idx"])
    image = Image.open(image_path).convert("RGB")

    embedding = list(image_embedding_model.embed([image]))[0]
    return embedding


@retry(wait=wait_exponential(multiplier=1, min=4, max=30), after=log_attempt_number)
def upload_batch(points):
    """Upload a batch of points to Qdrant with retry logic"""
    qdrant_client.upsert(collection_name, points=points)


@retry(wait=wait_exponential(multiplier=1, min=4, max=30), after=log_attempt_number)
async def process_item(item):
    """Process a single item with retry logic"""
    embedding = await create_embedding(item)
    return PointStruct(
        id=int(str(item["outfit_id"]) + str(item["item_idx"])),
        vector=embedding,
        payload={
            "outfit_id": item["outfit_id"],
            "item_idx": item["item_idx"],
            "keywords": item["keywords"],
            "category": item["category"],
        },
    )


async def main():
    logger.info("Started")
    items = get_all_items()
    i = 0
    points = []
    failed_items = []  # Keep track of items that fail all retries
    
    if not qdrant_client.collection_exists(collection_name):
        image_embeddings_size = image_embedding_model._get_model_description(
            "Qdrant/clip-ViT-B-32-vision"
        ).dim
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=image_embeddings_size, distance=Distance.COSINE
            ),
        )

    for item in items:
        try:
            point = await process_item(item)
            points.append(point)
            i += 1

            if i % BATCH_SIZE == 0:
                try:
                    upload_batch(points)
                    logger.info(f"Inserted {i} items into Qdrant")
                    points = []
                except Exception as e:
                    logger.error(f"Failed to upload batch after all retries: {e}")
                    failed_items.extend([p.payload for p in points])  # Store failed items
                    points = []
        except Exception as e:
            logger.error(
                f"Error processing item {item['outfit_id']}/{item['item_idx']} after all retries: {e}"
            )
            failed_items.append(item)
            continue

    if points:
        try:
            upload_batch(points)
            logger.info(f"Inserted {i} items into Qdrant")
        except Exception as e:
            logger.error(f"Failed to upload final batch after all retries: {e}")
            failed_items.extend([p.payload for p in points])

    if failed_items:
        logger.error(f"Failed to process {len(failed_items)} items after all retries:")
        for item in failed_items:
            logger.error(f"Failed item: outfit_id={item['outfit_id']}, item_idx={item['item_idx']}")


if __name__ == "__main__":
    asyncio.run(main())
