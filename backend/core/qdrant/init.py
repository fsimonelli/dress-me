from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
import json

embedding_model = TextEmbedding()

with open("data/polyvore_data/items.json", "r", encoding="utf-8") as f:
    items = json.load(f)

load_dotenv()

qdrant_client = QdrantClient(
    url="https://b5d753b8-7fcf-42c5-bf00-28480703e09e.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY"),
)

data = [item['description'] for item in items]
embeddings = list(embedding_model.embed(data))
vector_size = len(embeddings[0])

qdrant_client.create_collection(
    collection_name="item-embeddings",
    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
)

i = 0
points = []
for item, embedding in zip(items, embeddings):
    points.append(
        PointStruct(
            id=i,
            vector=embedding,
            payload={
                "id": item['id'],
                "keywords": item['keywords'],
                "category": item['category'],
            },
        )
    )
    i += 1
    if (i % 100 == 0):
        qdrant_client.upsert(collection_name="item-embeddings", points=points)
        if (i % 100 == 0):
            print(f"Inserted {i} items into Qdrant")
        points = []



#qdrant_client.delete_collection(collection_name="{collection_name}")


