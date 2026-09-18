from fastapi import APIRouter
from sqlalchemy.orm import Session
from ..schemas.market_schema import MarketDemand
from ..services.market_service import get_retailer_demands
from typing import List

router = APIRouter()

@router.get("/demands", response_model=List[MarketDemand])
def get_demands():
    return get_retailer_demands()
