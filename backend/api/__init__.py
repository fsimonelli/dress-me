from api.routes.uploadItem import router as upload_router
from api.routes.getRecommendation import router as recommendation_router
from api.routes.scrap import router as scrap_trendo

__all__ = [
    "upload_router",
    "recommendation_router",
    "scrap_trendo"
]
