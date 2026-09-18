from pydantic import BaseModel
from typing import List, Optional

class MandiPrice(BaseModel):
    crop: str
    price: float
    unit: str
    trend: str
    mandi: str

class MarketDemand(BaseModel):
    crop: str
    city: str
    quantity: str
    demand: str

class PricePoint(BaseModel):
    day: str
    price: float

class PriceAnalytics(BaseModel):
    crop: str
    trend7d: List[PricePoint]
    best_mandi: str
    demand_level: str
    ai_recommendation: Optional[str] = None
