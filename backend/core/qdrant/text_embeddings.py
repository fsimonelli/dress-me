from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
from backend.database.queries.get_selected_items import get_selected_items
embedding_model = TextEmbedding()

load_dotenv()

qdrant_client = QdrantClient(
    url="https://b5d753b8-7fcf-42c5-bf00-28480703e09e.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY"),
)

items = get_selected_items(processed=True)
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
                "outfit_id": item['outfit_id'],
                "item_idx": item['item_idx'],
                "keywords": item['keywords'],
                "category": item['category'],
            },
        )
    )
    i += 1
    if (i % 2 == 0):
        qdrant_client.upsert(collection_name="item-embeddings", points=points)
        print(f"Inserted {i} items into Qdrant")
        points = [] 



#qdrant_client.delete_collection(collection_name="{collection_name}")


