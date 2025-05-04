from fastapi import FastAPI

from api import upload_router

app = FastAPI(title="Dress Me", version="0.1.0")

app.include_router(upload_router, prefix="/uploadItem", tags=["uploadItem"])

@app.get("/")
def root():
    return {"message": "Hello world"}