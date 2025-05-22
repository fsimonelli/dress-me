from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


async def get_image_path(outfit_id, item_idx):
    image_path = BASE_DIR / Path(f"data/images/{outfit_id}/{item_idx}.jpg")
    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")
    return image_path
