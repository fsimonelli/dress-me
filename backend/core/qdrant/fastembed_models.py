from fastembed import TextEmbedding, ImageEmbedding

text_embedding_model = TextEmbedding()

image_embedding_model = ImageEmbedding(model_name="Qdrant/clip-ViT-B-32-vision")
