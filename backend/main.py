from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from services.image_service import get_image_path

from api import upload_router

app = FastAPI(title="Dress Me", version="0.1.0")

app.include_router(upload_router, prefix="/uploadItem", tags=["uploadItem"])


@app.get("/")
def root():
    return {"message": "Hello world"}


@app.get("/get_image/{outfit_id}/{item_idx}")
async def get_image(outfit_id, item_idx):
    try:
        image_path = await get_image_path(outfit_id, item_idx)
        return FileResponse(image_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Image not found")
