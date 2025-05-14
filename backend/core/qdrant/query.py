from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
import json

embedding_model = TextEmbedding()

load_dotenv()

qdrant_client = QdrantClient(
    url="https://b5d753b8-7fcf-42c5-bf00-28480703e09e.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY"),
)

def get_items(description):
    embedding = list(embedding_model.embed([description]))
    
    query = qdrant_client.query_points(
        collection_name="item-embeddings",
        query=embedding[0],
        limit=5,
    )
    
    return query
    

