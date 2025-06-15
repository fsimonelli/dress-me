from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from services.image_service import get_image_path
from fastapi.middleware.cors import CORSMiddleware

from api import upload_router, recommendation_router, scrap_trendo

app = FastAPI(title="Dress Me", version="0.1.0")

app.include_router(upload_router, prefix="/uploadItem", tags=["uploadItem"])
app.include_router(scrap_trendo, tags=["scrap_trendo"])

app.include_router(recommendation_router, prefix="/getRecommendation", tags=["getRecommendation"])

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
