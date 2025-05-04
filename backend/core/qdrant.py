from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os
from qdrant_client.models import Distance, VectorParams
from fastembed import TextEmbedding

embedding_model = TextEmbedding()

data = open("data/post.txt")

load_dotenv()

qdrant_client = QdrantClient(
    url="https://b5d753b8-7fcf-42c5-bf00-28480703e09e.us-east-1-0.aws.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY"),
)


qdrant_client.create_collection(
    collection_name="item-embeddings",
    vectors_config=VectorParams(size=4, distance=Distance.COSINE),
)


embeddings = list(embedding_model.embed(data))
qdrant_client.upsert(
    collection_name="item-embeddings",
    points=embeddings,
)

#qdrant_client.delete_collection(collection_name="{collection_name}")


