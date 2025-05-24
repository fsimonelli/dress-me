from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

from api import upload_router
from api import scrap_trendo

app = FastAPI(title="Dress Me", version="0.1.0")

app.include_router(upload_router, prefix="/uploadItem", tags=["uploadItem"])
app.include_router(scrap_trendo, prefix="/scrap", tags=["scrap_trendo"])

@app.get("/")
def root():
    return {"message": "Hello world"}

@app.get("/get_image/{outfit_id}/{item_idx}")
async def get_image(outfit_id, item_idx):
    image_path = Path(f"data/images/{outfit_id}/{item_idx}.jpg")
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)