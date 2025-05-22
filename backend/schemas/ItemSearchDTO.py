from pydantic import BaseModel


class ItemSearchDTO(BaseModel):
    description: str
