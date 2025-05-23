from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os

load_dotenv()

qdrant_client = QdrantClient(
    url="https://b5d753b8-7fcf-42c5-bf00-28480703e09e.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY"),
)


def get_items_by_text_embedding(text_embedding):
    query = qdrant_client.query_points(
        collection_name="item-embeddings",
        query=text_embedding[0],
        limit=5,
    )

    return query


def get_items_by_image_embedding(image_embedding):
    query = qdrant_client.query_points(
        collection_name="item-image-embeddings",
        query=image_embedding,
        limit=5,
    )

    return query
