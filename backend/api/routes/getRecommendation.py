from fastapi import APIRouter
from dotenv import load_dotenv
from database.queries.get_complementing_items import get_complementing_items

load_dotenv()

router = APIRouter()

@router.post("/")
async def get_recommendation(outfit_id: int, item_idx: int):
    recommendations = get_complementing_items(outfit_id, item_idx)
    return recommendations