from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.market_service import get_mandi_prices, get_7day_trend
from ..services.ai_market_service import get_ai_market_recommendation
from ..schemas.market_schema import MandiPrice, PricePoint, PriceAnalytics
from typing import List
import random

router = APIRouter()


@router.get("/prices", response_model=List[MandiPrice])
def get_prices(db: Session = Depends(get_db)):
    return get_mandi_prices(db)


@router.get("/insights/{crop}", response_model=PriceAnalytics)
async def get_insights(crop: str, price: float, trend: str, mandi: str, db: Session = Depends(get_db)):
    # Get the date-seeded 7-day trend from the smart simulation
    trend_points_raw = get_7day_trend(crop, price)
    trend_data = [PricePoint(day=t["day"], price=t["price"]) for t in trend_points_raw]

    # AI recommendation from Gemini
    ai_msg = await get_ai_market_recommendation(crop, price, trend, mandi)

    # Demand level — seeded so it's consistent per day per crop
    import hashlib, datetime
    seed = int(hashlib.md5(f"{crop}{datetime.date.today()}".encode()).hexdigest(), 16) % 100
    demand_level = "High" if seed > 45 else "Medium" if seed > 20 else "Low"

    return PriceAnalytics(
        crop=crop,
        trend7d=trend_data,
        best_mandi=mandi,
        demand_level=demand_level,
        ai_recommendation=ai_msg
    )
