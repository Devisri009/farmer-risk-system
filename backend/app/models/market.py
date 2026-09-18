from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func
from ..database import Base

class MarketCache(Base):
    __tablename__ = "market_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, index=True) # e.g., 'tamil_nadu_prices'
    data = Column(Text) # JSON string
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
