from pydantic import BaseModel


class ItemDTO(BaseModel):
    outfit_id: int
    item_idx: int
    keywords: str
    category: str
    description: str
