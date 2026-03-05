from sqlalchemy import Column, Integer, String, Text, DECIMAL, TIMESTAMP, func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(20))
    name = Column(String(100))
    username = Column(String(50), unique=True, index=True)
    phone = Column(String(15), unique=True, index=True)
    password_hash = Column(Text)
    government_id_type = Column(String(20))
    government_id_number = Column(String(50), unique=True, index=True)
    state = Column(String(100))
    district = Column(String(100))
    taluk = Column(String(100))
    village = Column(String(100))
    latitude = Column(DECIMAL, nullable=True)
    longitude = Column(DECIMAL, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer)  # In a real app, this would be a ForeignKey
    crop_name = Column(String(100))
    quantity = Column(String(50))
    price_per_kg = Column(DECIMAL)
    cultivate_date = Column(String(20))
    harvest_date = Column(String(20))
    location = Column(String(200))
    description = Column(Text, nullable=True)
    status = Column(String(20), default="Active") # Active, Sold, Pending
    risk_level = Column(String(20), default="Low") # Low, Moderate, High
    created_at = Column(TIMESTAMP, server_default=func.now())
