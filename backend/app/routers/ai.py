from fastapi import APIRouter
from ..services.ai_market_service import get_ai_market_recommendation

router = APIRouter()

@router.get("/ai-market-insight/{crop}")
async def get_market_ai_insight(crop: str, price: float, trend: str, mandi: str):
    recommendation = await get_ai_market_recommendation(crop, price, trend, mandi)
    return {"recommendation": recommendation}
