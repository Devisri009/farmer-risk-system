from sqlalchemy import Column, Integer, String, Text, DECIMAL, TIMESTAMP, func
from ..database import Base

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

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
    avatar = Column(String(255), default="👨‍🌾")
    created_at = Column(TIMESTAMP, server_default=func.now())

    posts = relationship("CommunityPost", back_populates="author")

class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    tag = Column(String(50)) # update, alert, question, tip
    crop_type = Column(String(100), nullable=True)
    location = Column(String(200)) # Full location
    image_url = Column(String(255), nullable=True)
    audio_url = Column(String(255), nullable=True) # For voice messages
    created_at = Column(TIMESTAMP, server_default=func.now())

    author = relationship("User", back_populates="posts")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")

class PostComment(Base):
    __tablename__ = "post_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User")

class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    post = relationship("CommunityPost", back_populates="likes")

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
    blockchain_tx_hash = Column(String(100), nullable=True)
    blockchain_status = Column(String(20), default="pending") # pending, confirmed, failed
    ipfs_hash = Column(String(100), nullable=True)
    stage = Column(String(50), default="Cultivation") # Cultivation, Growth, Harvest, Quality Grading, Marketplace Ready
    grade = Column(String(10), nullable=True) # A, B, etc.
    created_at = Column(TIMESTAMP, server_default=func.now())

    events = relationship("CropEvent", back_populates="crop", cascade="all, delete-orphan", order_by="CropEvent.created_at.asc()")

class CropEvent(Base):
    __tablename__ = "crop_events"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), index=True)
    activity = Column(String(100)) # Cultivation Started, Growth Update, Fertilizer Applied, etc.
    event_date = Column(String(50)) # Farmer-entered date (e.g., YYYY-MM-DD)
    description = Column(Text)
    quantity = Column(String(50), nullable=True)
    photo_url = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now()) # Server-generated submission timestamp

    crop = relationship("Crop", back_populates="events")
    farmer = relationship("User")

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, index=True) # ForeignKey to crops.id
    retailer_id = Column(Integer, index=True) # ForeignKey to users.id (the buyer)
    farmer_id = Column(Integer) # The original seller
    total_paid = Column(DECIMAL)
    transport_estimate = Column(DECIMAL, nullable=True)
    platform_fee = Column(DECIMAL, nullable=True)
    status = Column(String(20), default="Purchased") # Purchased, In Transit, Delivered
    tx_hash = Column(String(100), nullable=True) # Simulated blockchain tx hash
    created_at = Column(TIMESTAMP, server_default=func.now())
class AIVisdom(Base):
    __tablename__ = "ai_wisdom"

    id = Column(Integer, primary_key=True, index=True)
    question_key = Column(String(100), unique=True, index=True) # Normalized question key
    answer = Column(Text)
    language = Column(String(5), default='en')
    category = Column(String(50), default='general') # assistant or crop_rules
    created_at = Column(TIMESTAMP, server_default=func.now())


# --- Phase 2: AI Direct Buyer Matching Models ---

class BuyerDemand(Base):
    __tablename__ = "buyer_demands"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), index=True)
    buyer_name = Column(String(100), nullable=True)
    buyer_category = Column(String(50))  # Supermarkets, Restaurants & Hotels, Food-Processing, Exporters, Local Retailers, Government/Institutional
    crop_name = Column(String(100), index=True)
    target_quantity_kg = Column(DECIMAL)
    max_price_per_kg = Column(DECIMAL)
    frequency = Column(String(50), default="One-Time")  # One-Time, Weekly, Bi-Weekly, Monthly
    delivery_location = Column(String(200))
    delivery_district = Column(String(100), nullable=True)
    delivery_deadline = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="Pending")  # Pending, Matched, Confirmed, Fulfilled
    created_at = Column(TIMESTAMP, server_default=func.now())

    buyer = relationship("User")


class FarmerSupplyPool(Base):
    __tablename__ = "farmer_supply_pool"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), index=True)
    farmer_name = Column(String(100), nullable=True)
    crop_id = Column(Integer, nullable=True)
    crop_name = Column(String(100), index=True)
    available_quantity_kg = Column(DECIMAL)
    min_price_per_kg = Column(DECIMAL)
    location = Column(String(200))
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    latitude = Column(DECIMAL, nullable=True)
    longitude = Column(DECIMAL, nullable=True)
    harvest_date = Column(String(50), nullable=True)
    quality_grade = Column(String(10), default="A")
    status = Column(String(30), default="Available")  # Available, Allocated, Completed
    created_at = Column(TIMESTAMP, server_default=func.now())

    farmer = relationship("User")


class AggregatedContract(Base):
    __tablename__ = "aggregated_contracts"

    id = Column(Integer, primary_key=True, index=True)
    demand_id = Column(Integer, ForeignKey("buyer_demands.id"), index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), index=True)
    buyer_name = Column(String(100))
    buyer_category = Column(String(50))
    crop_name = Column(String(100))
    total_quantity_kg = Column(DECIMAL)
    agreed_price_per_kg = Column(DECIMAL)
    total_contract_value = Column(DECIMAL)
    delivery_location = Column(String(200))
    delivery_deadline = Column(String(50), nullable=True)
    status = Column(String(30), default="Matched")  # Matched, Confirmed, In Transit, Fulfilled
    farmer_allocations_json = Column(Text)  # JSON string: list of {farmer_id, farmer_name, phone, district, quantity_kg, payout_amount}
    blockchain_contract_tx = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    demand = relationship("BuyerDemand")
    buyer = relationship("User")

