from pydantic import BaseModel


class ItemResponseDTO(BaseModel):
    outfit_id: int
    item_idx: int
    keywords: str
    category: str
    description: str
