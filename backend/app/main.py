
import re
import json
import time
import hashlib
import traceback
import datetime
import requests
import sys
import os
import uuid
import shutil
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Form, UploadFile, File, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles

# --- Failsafe to ensure the 'app' module is always found ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Local imports
from . import models, schemas, auth, feed, climate_service, ai_service, blockchain
from . import weather_service, weather_advisor
from .models import market as market_models
from .database import engine, get_db, SessionLocal
from .routers import mandi, demand, ai as market_ai, buyer_matching
from .services import prediction_engine, weather_aggregator, crop_recommender

from sqlalchemy import text
models.Base.metadata.create_all(bind=engine)

# Safe SQLite migration to add blockchain_status if not present
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE crops ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'pending'"))
        conn.commit()
except Exception:
    pass

app = FastAPI(title="FarmVista API")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://0.0.0.0:5173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Fixed Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    if isinstance(exc, StarletteHTTPException):
        response = JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    else:
        print(f"CRITICAL SYSTEM ERROR: {exc}")
        traceback.print_exc()
        response = JSONResponse(
            status_code=500,
            content={"detail": str(exc)},
        )

    # Ensure CORS headers always exist
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"

    return response


app.include_router(feed.router, prefix="/api/feed", tags=["feed"])
app.include_router(mandi.router, prefix="/api/mandi", tags=["mandi"])
app.include_router(demand.router, prefix="/api/market-demand", tags=["demand"])
app.include_router(market_ai.router, prefix="/api/market-ai", tags=["market-ai"])
app.include_router(buyer_matching.router, prefix="/api/matching", tags=["buyer-matching"])

# Serve static files for community uploads (images, audio) and crop updates
os.makedirs("static/uploads/crop_updates", exist_ok=True)
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")


def get_mock_coordinates(district: str):
    locations = {
        "madurai": (9.925, 78.119),
        "chennai": (13.0827, 80.2707),
        "coimbatore": (11.0168, 76.9558),
        "salem": (11.6643, 78.1460),
        "tiruchirappalli": (10.7905, 78.7047),
    }
    return locations.get(district.lower(), (None, None))


# ---------------- AUTH ----------------

@app.post("/api/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    username_lower = user.username.strip().lower()

    if db.query(models.User).filter(models.User.username == username_lower).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    if db.query(models.User).filter(models.User.phone == user.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    if db.query(models.User).filter(models.User.government_id_number == user.government_id_number).first():
        raise HTTPException(status_code=400, detail="Government ID number already registered")

    hashed_password = auth.get_password_hash(user.password)
    lat, lng = get_mock_coordinates(user.district)

    db_user = models.User(
        role=user.role,
        name=user.name,
        username=username_lower,
        phone=user.phone,
        password_hash=hashed_password,
        government_id_type=user.government_id_type,
        government_id_number=user.government_id_number,
        state=user.state,
        district=user.district,
        taluk=user.taluk,
        village=user.village,
        latitude=lat,
        longitude=lng
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        if "users.phone" in error_msg:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        elif "users.username" in error_msg:
            raise HTTPException(status_code=400, detail="Username already exists")
        elif "users.government_id_number" in error_msg:
            raise HTTPException(status_code=400, detail="Government ID number already registered")
        raise HTTPException(status_code=400, detail="Registration failed due to a database integrity error")

    access_token = auth.create_access_token(data={"sub": db_user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
        "user": db_user
    }


@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    login_id = user_credentials.username.strip().lower()

    user = db.query(models.User).filter(
        (models.User.username == login_id) |
        (models.User.phone == login_id)
    ).first()

    if not user or not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials"
        )

    access_token = auth.create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user
    }


@app.get("/")
def read_root():
    return {"status": "Online", "service": "FarmVista API", "blockchain": "Connected"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@app.put("/api/auth/profile-update", response_model=schemas.UserResponse)
def update_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/auth/avatar-update", response_model=schemas.UserResponse)
async def update_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Ensure directory exists
    avatar_dir = "static/uploads/avatars"
    os.makedirs(avatar_dir, exist_ok=True)
    
    # Save file
    import uuid
    import shutil
    
    ext = os.path.splitext(avatar.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(avatar_dir, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(avatar.file, buffer)
    
    # Update DB
    avatar_url = f"/static/uploads/avatars/{filename}"
    current_user.avatar = avatar_url
    db.commit()
    db.refresh(current_user)
    
    return current_user


# ---------------- CROPS ----------------

@app.post("/api/crops", response_model=schemas.CropResponse)
def post_crop(
    background_tasks: BackgroundTasks,
    cropName: str = Form(...),
    quantity: str = Form(...),
    pricePerKg: str = Form(...),
    cultivateDate: str = Form(...),
    harvestDate: str = Form(...),
    location: str = Form(...),
    description: Optional[str] = Form(""),
    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):

    try:
        p_val = float(pricePerKg)
    except:
        p_val = 0.0

    db_crop = models.Crop(
        farmer_id=current_user.id,
        crop_name=cropName,
        quantity=quantity,
        price_per_kg=p_val,
        cultivate_date=cultivateDate,
        harvest_date=harvestDate,
        location=location,
        description=description,
        status="Active",
        risk_level="Low"
    )

    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)

    # --- 🏗️ Blockchain Integration (Background Task) ---
    def run_blockchain_task(cid: int, cdata: dict):
        idb = SessionLocal()
        try:
            print(f"BLOCKCHAIN: Starting registration for crop batch {cid}...")
            tx = blockchain.register_crop_on_blockchain(cdata)
            if tx:
                print(f"BLOCKCHAIN: SUCCESS! Tx Hash: {tx}")
                c = idb.query(models.Crop).filter(models.Crop.id == cid).first()
                if c:
                    c.blockchain_tx_hash = tx
                    c.blockchain_status = "confirmed"
                    idb.commit()
            else:
                c = idb.query(models.Crop).filter(models.Crop.id == cid).first()
                if c:
                    c.blockchain_status = "failed"
                    idb.commit()
        except Exception as e:
            print(f"BLOCKCHAIN ERROR: Failed for batch {cid}: {e}")
            traceback.print_exc()
            c = idb.query(models.Crop).filter(models.Crop.id == cid).first()
            if c:
                c.blockchain_status = "failed"
                idb.commit()
        finally:
            idb.close()

    background_tasks.add_task(
        run_blockchain_task, 
        db_crop.id, 
        {
            "crop_name": db_crop.crop_name,
            "quantity": db_crop.quantity,
            "price_per_kg": float(db_crop.price_per_kg),
            "location": db_crop.location,
            "cultivate_date": db_crop.cultivate_date,
            "harvest_date": db_crop.harvest_date,
            "description": db_crop.description,
            "risk_level": db_crop.risk_level
        }
    )

    return db_crop


@app.get("/api/farmer/batches", response_model=list[schemas.CropResponse])
def get_farmer_batches(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Crop).filter(models.Crop.farmer_id == current_user.id).order_by(models.Crop.created_at.desc()).all()


@app.get("/api/farmer/batches/{batch_id}", response_model=schemas.CropResponse)
def get_batch_by_id(batch_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    batch = db.query(models.Crop).filter(models.Crop.id == batch_id, models.Crop.farmer_id == current_user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@app.patch("/api/farmer/batches/{batch_id}/status", response_model=schemas.CropResponse)
def update_crop_status(batch_id: int, status_update: schemas.CropStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    crop = db.query(models.Crop).filter(models.Crop.id == batch_id, models.Crop.farmer_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    crop.status = status_update.status
    db.commit()
    db.refresh(crop)
    return crop


@app.patch("/api/farmer/batches/{batch_id}/journey", response_model=schemas.CropResponse)
def update_crop_journey(batch_id: int, journey_update: schemas.CropJourneyUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    crop = db.query(models.Crop).filter(models.Crop.id == batch_id, models.Crop.farmer_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    crop.stage = journey_update.stage
    if journey_update.grade is not None:
        crop.grade = journey_update.grade
        
    db.commit()
    db.refresh(crop)
    return crop


# Helper mapping from activity to journey stage and batch status
ACTIVITY_STAGE_STATUS_MAP = {
    "Cultivation Started": ("Cultivation", "PLANTED"),
    "Growth Update": ("Growth", "GROWING"),
    "Fertilizer Applied": ("Growth", "GROWING"),
    "Irrigation": ("Growth", "GROWING"),
    "Pest/Disease Observation": ("Growth", "GROWING"),
    "Weather Impact": ("Growth", "GROWING"),
    "Harvest": ("Harvest", "HARVESTED"),
    "Quality Check": ("Quality Grading", "READY_FOR_HARVEST"),
    "Marketplace Ready": ("Marketplace Ready", "LISTED"),
}


@app.post("/api/farmer/batches/{batch_id}/events", response_model=schemas.CropEventResponse)
def create_batch_event(
    batch_id: int,
    activity: str = Form(...),
    eventDate: str = Form(...),
    description: str = Form(...),
    quantity: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Creates a new chronological crop event linked to batch_id & authenticated farmer."""
    crop = db.query(models.Crop).filter(
        models.Crop.id == batch_id,
        models.Crop.farmer_id == current_user.id
    ).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Batch not found or unauthorized")

    photo_url = None
    if photo and photo.filename:
        upload_dir = "static/uploads/crop_updates"
        os.makedirs(upload_dir, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_url = f"/static/uploads/crop_updates/{filename}"

    # Create immutable event record
    new_event = models.CropEvent(
        crop_id=crop.id,
        farmer_id=current_user.id,
        activity=activity,
        event_date=eventDate,
        description=description,
        quantity=quantity,
        photo_url=photo_url
    )
    db.add(new_event)

    # Derive new stage & status from the activity if recognized
    if activity in ACTIVITY_STAGE_STATUS_MAP:
        new_stage, new_status = ACTIVITY_STAGE_STATUS_MAP[activity]
        crop.stage = new_stage
        crop.status = new_status
    elif activity == "Other":
        # Keep current stage and status
        pass

    db.commit()
    db.refresh(new_event)
    db.refresh(crop)
    return new_event


@app.get("/api/farmer/batches/{batch_id}/events", response_model=List[schemas.CropEventResponse])
def get_batch_events(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Returns all chronological events for a specific farmer batch."""
    crop = db.query(models.Crop).filter(
        models.Crop.id == batch_id,
        models.Crop.farmer_id == current_user.id
    ).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Batch not found or unauthorized")

    events = db.query(models.CropEvent).filter(
        models.CropEvent.crop_id == batch_id
    ).order_by(models.CropEvent.created_at.asc()).all()
    return events


@app.get("/api/dashboard/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Real active crop count - Include all stages except Sold/Delivered
    active_crops = db.query(models.Crop).filter(
        models.Crop.farmer_id == current_user.id,
        models.Crop.status.not_in(["SOLD", "DELIVERED", "Sold"])
    ).all()
    active_count = len(active_crops)

    # Real revenue: sum of price_per_kg * numeric(quantity) for all these crops
    total_revenue = 0.0
    for crop in active_crops:
        try:
            # Extract numbers from quantity (e.g., "1000 kg" -> 1000)
            qty_str = ''.join(c for c in (crop.quantity or '') if c.isdigit() or c == '.')
            qty = float(qty_str) if qty_str else 0.0
            price = float(crop.price_per_kg) if crop.price_per_kg else 0.0
            total_revenue += qty * price
        except Exception:
            pass

    # Format revenue string (e.g., 20000 -> "20,000")
    revenue_str = f"{int(total_revenue):,}"

    # Real alert count: fetch counts based on risk level
    high_risk_count = db.query(models.Crop).filter(
        models.Crop.farmer_id == current_user.id,
        models.Crop.risk_level == "High"
    ).count()

    return {"active_crops": active_count, "revenue": revenue_str, "alerts": high_risk_count}


@app.get("/api/dashboard/batches-per-month")
def get_batches_per_month(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Return batch count grouped by month for last 6 months."""
    from collections import defaultdict
    import datetime

    now = datetime.datetime.utcnow()
    # Build last 6 month labels
    months = []
    for i in range(5, -1, -1):
        d = (now.replace(day=1) - datetime.timedelta(days=i * 30)).replace(day=1)
        months.append((d.year, d.month))

    all_batches = db.query(models.Crop).filter(
        models.Crop.farmer_id == current_user.id
    ).all()

    counts = defaultdict(int)
    for batch in all_batches:
        if batch.created_at:
            key = (batch.created_at.year, batch.created_at.month)
            counts[key] += 1

    MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    result = []
    for (year, month) in months:
        result.append({
            "month": MONTH_ABBR[month - 1],
            "count": counts.get((year, month), 0)
        })
    return result


@app.get("/api/price-prediction", response_model=schemas.PricePrediction)
async def get_price_prediction(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Multi-factor price prediction based on farmer's active batches, weather, and market signals."""
    active_crops = db.query(models.Crop).filter(
        models.Crop.farmer_id == current_user.id,
        models.Crop.status.not_in(["SOLD", "DELIVERED", "Sold"])
    ).all()

    if not active_crops:
        return {
            "sell_today": 0,
            "wait_3_days": 0,
            "potential_gain": 0,
            "action": "SELL_NOW",
            "confidence_score": 0,
            "crop_name": None,
            "recommendation_text": "Post a crop batch to receive real-time market predictions.",
            "recommendation_text_ta": "சந்தை கணிப்புகளைப் பெற பயிர் தொகுப்பை பதிவிடவும்.",
            "factors": []
        }

    # Find primary active batch by value
    best_crop = None
    best_value = 0.0
    best_qty = 100.0
    best_price = 0.0

    for crop in active_crops:
        try:
            qty_str = ''.join(c for c in (crop.quantity or '') if c.isdigit() or c == '.')
            qty = float(qty_str) if qty_str else 100.0
            price = float(crop.price_per_kg) if crop.price_per_kg else 0.0
            val = qty * price
            if val >= best_value:
                best_value = val
                best_crop = crop
                best_qty = qty
                best_price = price
        except Exception:
            pass

    if not best_crop:
        best_crop = active_crops[0]
        best_price = float(best_crop.price_per_kg or 25.0)
        best_qty = 100.0

    # Fetch real-time weather for current farmer's coordinates
    lat, lon = _get_farmer_coords(current_user)
    loc_str = _get_location_str(current_user)
    try:
        weather_data = await weather_service.get_current_weather(lat, lon)
    except Exception as e:
        print(f"[PREDICTION] Weather fetch fallback: {e}")
        weather_data = None

    prediction = prediction_engine.calculate_sell_wait_prediction(
        crop_name=best_crop.crop_name or "Crop",
        quantity_kg=best_qty,
        current_price_per_kg=best_price,
        weather_data=weather_data,
        location_str=loc_str
    )

    return prediction


@app.get("/api/marketplace", response_model=list[schemas.MarketplaceCrop])
def get_marketplace_crops(db: Session = Depends(get_db)):
    # Display all crops that are in some lifecycle stage, even if not yet listed
    # Filter out any hidden or purely internal states if they exist
    all_crops = db.query(models.Crop).order_by(models.Crop.created_at.desc()).all()
    marketplace_data = []
    for crop in all_crops:
        marketplace_data.append({
            "id": crop.id,
            "crop_name": crop.crop_name,
            "quantity": crop.quantity,
            "price": float(crop.price_per_kg) if crop.price_per_kg else 0.0,
            "location": crop.location,
            "risk_level": crop.risk_level or "Low",
            "status": crop.status or "Active",
            "verified": bool(crop.blockchain_tx_hash)
        })
    return marketplace_data


@app.get("/api/crops/recommendations", response_model=schemas.CropRecommendationResponse)
async def get_crop_recommendations(
    soil_type: Optional[str] = Query(None, description="Optional soil type filter (e.g. Red Soil, Black Soil, Alluvial, Sandy Loam)"),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Climate-aware crop recommendations powered by Phase 3 multi-source weather consensus,
    current season, soil types, and regional agro-climatic suitability.
    """
    lat, lon = _get_farmer_coords(current_user)
    district = current_user.district or "Madurai"
    state = current_user.state or "Tamil Nadu"
    ogd_key = os.getenv("OGD_API_KEY", "")

    try:
        weather_data = await weather_aggregator.aggregate(
            lat=lat, lon=lon, district=district, state=state, ogd_api_key=ogd_key
        )
    except Exception as e:
        print(f"[CropRecommender] Weather aggregate error: {e}")
        weather_data = None

    return crop_recommender.recommend_crops(
        weather_data=weather_data,
        district=district,
        state=state,
        soil_type=soil_type,
    )


# ---------------- RETAILER & TRANSACTIONS ----------------

@app.get("/api/marketplace/prices")
def get_marketplace_prices():
    # Mock data for frontend charts
    return {
        "dates": ["Jan", "Feb", "Mar", "Apr", "May"],
        "prices": [45, 48, 42, 50, 52]
    }


@app.get("/api/marketplace/demands")
def get_market_demands():
    # Mock data for frontend charts
    return [
        {"crop": "Tomato", "demand": 85},
        {"crop": "Rice", "demand": 95},
        {"crop": "Onion", "demand": 60}
    ]


@app.get("/api/chain/stats")
def get_chain_stats(db: Session = Depends(get_db)):
    """
    Public aggregated on-chain statistics for dashboards, counters, and status indicators.
    Never exposes private keys or operational wallet addresses.
    """
    total_crops = db.query(models.Crop).count()
    confirmed_crops = db.query(models.Crop).filter(
        (models.Crop.blockchain_status == "confirmed") | (models.Crop.blockchain_tx_hash.isnot(None))
    ).count()
    pending_crops = db.query(models.Crop).filter(
        models.Crop.blockchain_status == "pending",
        models.Crop.blockchain_tx_hash.is_(None)
    ).count()

    contract_addr = os.getenv("CONTRACT_ADDRESS", "0x01b3990B92506A429f7967056210e4931f8A13D8")

    return {
        "total_batches_on_chain": confirmed_crops,
        "confirmed_batches": confirmed_crops,
        "pending_batches": pending_crops,
        "total_crops": total_crops,
        "network": "Polygon Amoy Testnet",
        "chain_id": 80002,
        "contract_address": contract_addr,
        "explorer_url": f"https://amoy.polygonscan.com/address/{contract_addr}"
    }


@app.get("/api/public/trace/{crop_id}")
def get_public_trace(crop_id: int, db: Session = Depends(get_db)):
    """Public endpoint (no auth) — returns crop traceability info for QR scan page."""
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    farmer = db.query(models.User).filter(models.User.id == crop.farmer_id).first()

    # Fetch actual logged farmer events
    events = db.query(models.CropEvent).filter(
        models.CropEvent.crop_id == crop.id
    ).order_by(models.CropEvent.created_at.asc()).all()

    # Build a lifecycle timeline from available data & logged events
    timeline = []
    if crop.created_at:
        timeline.append({
            "date": crop.created_at.strftime("%Y-%m-%d"),
            "submissionTimestamp": crop.created_at.isoformat(),
            "event": "Crop Registered",
            "detail": f"Batch #{crop.id} created on FarmVista and blockchain registered.",
            "photoUrl": None,
            "quantity": crop.quantity
        })
    if crop.cultivate_date and not any(e.activity == "Cultivation Started" for e in events):
        timeline.append({
            "date": crop.cultivate_date,
            "submissionTimestamp": crop.created_at.isoformat() if crop.created_at else None,
            "event": "Cultivation Started",
            "detail": f"{crop.crop_name} cultivation began at {crop.location}.",
            "photoUrl": None,
            "quantity": None
        })

    # Include all real farmer crop update events
    for e in events:
        timeline.append({
            "id": e.id,
            "date": e.event_date,
            "submissionTimestamp": e.created_at.isoformat() if e.created_at else None,
            "event": e.activity,
            "detail": e.description,
            "quantity": e.quantity,
            "photoUrl": e.photo_url
        })

    # Fallback stage progression if no custom events exist yet (backwards compatibility)
    if not events:
        stage_order = ["Cultivation", "Growth", "Harvest", "Quality Grading", "Marketplace Ready"]
        current_stage = crop.stage or "Cultivation"
        reached_idx = stage_order.index(current_stage) if current_stage in stage_order else 0
        for s in stage_order[1:reached_idx + 1]:
            timeline.append({
                "date": crop.harvest_date if s == "Harvest" else "—",
                "submissionTimestamp": None,
                "event": s,
                "detail": f"Crop advanced to '{s}' stage." + (f" Grade: {crop.grade}" if s == "Quality Grading" and crop.grade else ""),
                "photoUrl": None,
                "quantity": None
            })

    if crop.blockchain_tx_hash:
        timeline.append({
            "date": crop.created_at.strftime("%Y-%m-%d") if crop.created_at else "—",
            "submissionTimestamp": crop.created_at.isoformat() if crop.created_at else None,
            "event": "Blockchain Verified",
            "detail": f"Transaction recorded on Polygon Amoy: {crop.blockchain_tx_hash[:20]}...",
            "photoUrl": None,
            "quantity": None
        })

    return {
        "id": crop.id,
        "cropName": crop.crop_name,
        "quantity": crop.quantity,
        "pricePerKg": float(crop.price_per_kg) if crop.price_per_kg else 0.0,
        "cultivateDate": crop.cultivate_date,
        "harvestDate": crop.harvest_date,
        "location": crop.location,
        "stage": crop.stage or "Cultivation",
        "grade": crop.grade,
        "status": crop.status,
        "riskLevel": crop.risk_level,
        "blockchainTxHash": crop.blockchain_tx_hash,
        "verified": bool(crop.blockchain_tx_hash),
        "farmerStr": farmer.name if farmer else "Verified Farm",
        "farmerDistrict": farmer.district if farmer else None,
        "farmerState": farmer.state if farmer else None,
        "timeline": timeline,
        "events": [
            {
                "id": e.id,
                "activity": e.activity,
                "eventDate": e.event_date,
                "description": e.description,
                "quantity": e.quantity,
                "photoUrl": e.photo_url,
                "createdAt": e.created_at.isoformat() if e.created_at else None
            }
            for e in events
        ]
    }


@app.get("/api/payment-estimate/{crop_id}")
@app.get("/payment-estimate/{crop_id}")
def get_payment_estimate(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    if crop.status not in ["Active", "LISTED"]:
        raise HTTPException(status_code=400, detail="Crop not available for purchase")
        
    farmer = db.query(models.User).filter(models.User.id == crop.farmer_id).first()
    
    try:
        qty_num = float(''.join(c for c in crop.quantity if c.isdigit() or c == '.'))
    except (ValueError, TypeError):
        qty_num = 100
        
    base_cost = qty_num * float(crop.price_per_kg)
    transport = min(base_cost * 0.05, 1500.0)
    platform_fee = base_cost * 0.01
    
    return {
        "cropName": crop.crop_name,
        "quantity": crop.quantity,
        "farmerStr": farmer.name if farmer else "Verified Farm",
        "breakdown": {
            "baseCost": base_cost,
            "transportEstimate": transport,
            "platformFee": platform_fee,
            "total": base_cost + transport + platform_fee
        }
    }


@app.post("/api/purchase")
@app.post("/purchase")
def confirm_purchase(
    req: schemas.PaymentConfirmRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["consumer", "retailer"]:
        raise HTTPException(status_code=403, detail="Only consumers can make purchases")
        
    crop = db.query(models.Crop).filter(models.Crop.id == req.crop_id).first()
    if not crop or crop.status != "Active":
        raise HTTPException(status_code=400, detail="Crop not available for purchase")
        
    crop.status = "Sold"
    
    # Mock tx hash
    mock_hash = "0x" + hashlib.sha256(str(time.time()).encode()).hexdigest()[:40]
    
    purchase = models.Purchase(
        crop_id=crop.id,
        retailer_id=current_user.id,
        farmer_id=crop.farmer_id,
        total_paid=req.total_amount,
        transport_estimate=req.transport_estimate,
        platform_fee=req.platform_fee,
        tx_hash=mock_hash
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    return {"message": "Purchase successful", "purchase_id": purchase.id, "tx_hash": mock_hash}


@app.get("/api/consumer/purchases", response_model=list[schemas.PurchaseResponse])
@app.get("/api/retailer/purchases", response_model=list[schemas.PurchaseResponse])
def get_consumer_purchases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["consumer", "retailer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    purchases = db.query(models.Purchase).filter(models.Purchase.retailer_id == current_user.id).order_by(models.Purchase.created_at.desc()).all()
    results = []
    for p in purchases:
        # Note: idb lookup logic for crop/farmer to build response
        crop = db.query(models.Crop).filter(models.Crop.id == p.crop_id).first()
        farmer = db.query(models.User).filter(models.User.id == p.farmer_id).first()
        results.append({
            "id": p.id,
            "tx_hash": p.tx_hash or "Pending",
            "crop_name": crop.crop_name if crop else "Unknown",
            "quantity": crop.quantity if crop else "Unknown",
            "farmer_name": farmer.name if farmer else "Verified Farm",
            "total_paid": float(p.total_paid),
            "status": p.status,
            "date": p.created_at.strftime("%Y-%m-%d")
        })
    return results


# ---------------- CLIMATE (Open-Meteo + Gemini AI) ----------------

def _get_farmer_coords(user):
    """Get latitude/longitude for a user, with sensible defaults."""
    lat = float(user.latitude) if user.latitude else None
    lon = float(user.longitude) if user.longitude else None
    if not lat or not lon:
        lat, lon = get_mock_coordinates(user.district or "madurai")
    if not lat or not lon:
        lat, lon = 9.925, 78.119  # Default: Madurai
    return lat, lon


def _get_location_str(user):
    if user.district:
        return f"{user.district}, {user.state}" if user.state else user.district
    return "Madurai, TN"


@app.get("/api/climate", response_model=schemas.ClimateData)
async def get_climate_readings(current_user: models.User = Depends(auth.get_current_user)):
    """Consensus multi-source weather data (Open-Meteo, ECMWF IFS, NOAA GFS, NASA POWER, IMD)."""
    lat, lon = _get_farmer_coords(current_user)
    loc_str = _get_location_str(current_user)
    district = current_user.district or "Madurai"
    state = current_user.state or "Tamil Nadu"
    ogd_key = os.getenv("OGD_API_KEY", "")

    try:
        agg = await weather_aggregator.aggregate(
            lat=lat, lon=lon, district=district, state=state, ogd_api_key=ogd_key
        )
        return {
            "temperature": agg.get("temperature", 0),
            "rainfall": agg.get("rainfall", 0),
            "rain_chance": agg.get("rain_chance", 0),
            "humidity": agg.get("humidity", 0),
            "windSpeed": agg.get("windSpeed", 0),
            "location": loc_str,
            "sources_used": agg.get("sources_used", ["Open-Meteo"]),
            "confidence_score": agg.get("confidence_score", 75),
            "source_agreement": agg.get("source_agreement", "Moderate"),
            "imd_alerts": agg.get("imd_alerts", []),
        }
    except Exception as e:
        print(f"Weather aggregator error: {e}")
        try:
            data = await weather_service.get_current_weather(lat, lon)
            data["location"] = loc_str
            return data
        except Exception as e2:
            print(f"Fallback weather error: {e2}")
            return {
                "temperature": 0,
                "rainfall": 0,
                "humidity": 0,
                "windSpeed": 0,
                "location": loc_str
            }


@app.get("/api/climate/forecast")
async def get_climate_forecast(current_user: models.User = Depends(auth.get_current_user)):
    """5-day weather forecast cross-validated across multi-source consensus."""
    lat, lon = _get_farmer_coords(current_user)
    district = current_user.district or "Madurai"
    state = current_user.state or "Tamil Nadu"
    ogd_key = os.getenv("OGD_API_KEY", "")

    try:
        agg = await weather_aggregator.aggregate(lat=lat, lon=lon, district=district, state=state, ogd_api_key=ogd_key)
        forecast = agg.get("forecast")
        if forecast:
            return forecast
    except Exception as e:
        print(f"Aggregator forecast error: {e}")

    try:
        forecast = await weather_service.get_forecast(lat, lon, days=5)
        return forecast
    except Exception as e:
        print(f"Forecast error: {e}")
        return []


@app.get("/api/climate/risk")
async def calculate_crop_risks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """AI-powered crop risk assessment based on multi-source aggregated weather."""
    lat, lon = _get_farmer_coords(current_user)
    loc_str = _get_location_str(current_user)
    district = current_user.district or "Madurai"
    state = current_user.state or "Tamil Nadu"
    ogd_key = os.getenv("OGD_API_KEY", "")

    # Get aggregated weather
    try:
        weather = await weather_aggregator.aggregate(lat=lat, lon=lon, district=district, state=state, ogd_api_key=ogd_key)
        forecast = weather.get("forecast", [])
    except Exception as e:
        print(f"Aggregator error in risk calculation: {e}")
        weather = await weather_service.get_current_weather(lat, lon)
        forecast = await weather_service.get_forecast(lat, lon, days=5)

    # Get farmer's registered crops
    user_crops = db.query(models.Crop).filter(models.Crop.farmer_id == current_user.id).all()
    crop_names = list(set([c.crop_name.strip().title() for c in user_crops])) if user_crops else []
    if not crop_names:
        crop_names = ["Rice", "Tomato", "Corn", "Groundnut"]

    # Get AI-powered advice
    advice = await weather_advisor.generate_crop_recommendations(
        weather=weather,
        forecast=forecast,
        farmer_crops=crop_names,
        location=loc_str,
    )

    return {
        "location": loc_str,
        "risks": advice.get("recommendations", [])
    }


@app.get("/api/climate/alerts")
async def get_climate_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Multi-source weather alerts merging IMD official alerts and AI analysis."""
    lat, lon = _get_farmer_coords(current_user)
    loc_str = _get_location_str(current_user)
    district = current_user.district or "Madurai"
    state = current_user.state or "Tamil Nadu"
    ogd_key = os.getenv("OGD_API_KEY", "")

    try:
        agg = await weather_aggregator.aggregate(lat=lat, lon=lon, district=district, state=state, ogd_api_key=ogd_key)
        weather = agg
        forecast = agg.get("forecast", [])
        imd_raw_alerts = agg.get("imd_alerts", [])
    except Exception as e:
        print(f"Weather aggregator alerts fetch error: {e}")
        weather = await weather_service.get_current_weather(lat, lon)
        forecast = await weather_service.get_forecast(lat, lon, days=5)
        imd_raw_alerts = []

    user_crops = db.query(models.Crop).filter(models.Crop.farmer_id == current_user.id).all()
    crop_names = list(set([c.crop_name.strip().title() for c in user_crops])) if user_crops else []
    if not crop_names:
        crop_names = ["Rice", "Tomato", "Corn"]

    advice = await weather_advisor.generate_crop_recommendations(
        weather=weather,
        forecast=forecast,
        farmer_crops=crop_names,
        location=loc_str,
    )

    ai_alerts = advice.get("alerts", [])
    merged_alerts = []

    # 1. Add IMD official alerts if present
    for i, imd in enumerate(imd_raw_alerts):
        merged_alerts.append({
            "id": f"imd-{i+1}",
            "type": imd.get("type", "IMD Official Warning"),
            "severity": imd.get("severity", "High"),
            "location": loc_str,
            "time": imd.get("valid_until", "Active Alert"),
            "description": imd.get("description", ""),
            "advice": "Follow IMD official advisories and secure crops/irrigation systems.",
            "source": "IMD (Official)"
        })

    # 2. Add AI alerts with source attribute
    for i, alert in enumerate(ai_alerts):
        alert.setdefault("id", f"ai-{i + 1}")
        alert.setdefault("type", "Weather Alert")
        alert.setdefault("severity", "Medium")
        alert.setdefault("location", loc_str)
        alert.setdefault("time", "Today")
        alert.setdefault("description", "")
        alert.setdefault("advice", "")
        alert.setdefault("source", "FarmVista Consensus AI")
        merged_alerts.append(alert)

    return merged_alerts


@app.get("/api/climate/source-status")
async def get_climate_source_status():
    """Returns operational status and reliability scores of all weather data sources."""
    return await weather_aggregator.get_source_status()


@app.get("/api/farming-advice")
async def get_farming_advice(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """AI-generated farming tips based on real-time weather."""
    lat, lon = _get_farmer_coords(current_user)
    loc_str = _get_location_str(current_user)

    weather = await weather_service.get_current_weather(lat, lon)
    forecast = await weather_service.get_forecast(lat, lon, days=5)

    user_crops = db.query(models.Crop).filter(models.Crop.farmer_id == current_user.id).all()
    crop_names = list(set([c.crop_name.strip().title() for c in user_crops])) if user_crops else []
    if not crop_names:
        crop_names = ["Rice", "Tomato", "Corn"]

    advice = await weather_advisor.generate_crop_recommendations(
        weather=weather,
        forecast=forecast,
        farmer_crops=crop_names,
        location=loc_str,
    )

    return advice.get("farmingTips", ["Monitor your crops regularly"])


# ---------------- GOVERNMENT SCHEMES PERSONALIZATION ----------------

@app.get("/api/schemes/personalized")
def get_personalized_schemes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Returns personalized scheme recommendations ranked by relevance to the farmer's
    location (state/district) and registered crops.
    """
    user_crops = db.query(models.Crop).filter(models.Crop.farmer_id == current_user.id).all()
    crop_names = list(set([c.crop_name.strip().title() for c in user_crops if c.crop_name]))
    if not crop_names:
        crop_names = ["Rice", "Tomato"]

    district = (current_user.district or "").strip().title()
    state = (current_user.state or "Tamil Nadu").strip().title()

    SCHEME_CATALOGUE = [
        {"id": "pm-kisan", "name": "PM-KISAN", "type": "subsidy", "level": "central", "crops": ["all"], "match_bonus": 4},
        {"id": "pmfby", "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)", "type": "insurance", "level": "central", "crops": ["Rice", "Paddy", "Corn", "Groundnut", "Cotton", "Sugarcane"], "match_bonus": 6},
        {"id": "kcc", "name": "Kisan Credit Card (KCC)", "type": "loan", "level": "central", "crops": ["all"], "match_bonus": 3},
        {"id": "tn-solar-pump", "name": "TN Solar Powered Pump Scheme", "type": "subsidy", "level": "state", "crops": ["all"], "match_bonus": 5},
        {"id": "tn-micro-irrigation", "name": "TN Micro Irrigation Scheme", "type": "subsidy", "level": "state", "crops": ["Tomato", "Chilli", "Banana", "Sugarcane", "Onion", "Groundnut"], "match_bonus": 7},
        {"id": "pkvy", "name": "Paramparagat Krishi Vikas Yojana (PKVY)", "type": "subsidy", "level": "central", "crops": ["Turmeric", "Rice", "Tomato", "Banana"], "match_bonus": 5},
        {"id": "smam", "name": "Sub-Mission on Agricultural Mechanization (SMAM)", "type": "subsidy", "level": "central", "crops": ["Rice", "Paddy", "Sugarcane", "Corn"], "match_bonus": 5},
        {"id": "tn-ifs", "name": "TN Integrated Farming System (IFS)", "type": "subsidy", "level": "state", "crops": ["all"], "match_bonus": 6},
        {"id": "midh", "name": "Mission for Integrated Development of Horticulture (MIDH)", "type": "subsidy", "level": "central", "crops": ["Tomato", "Banana", "Onion", "Chilli", "Mango", "Turmeric"], "match_bonus": 7},
        {"id": "kalaignar-agri", "name": "Kalaignarin All Village Integrated Agri Dev", "type": "subsidy", "level": "state", "crops": ["all"], "match_bonus": 6},
    ]

    scored = []
    for s in SCHEME_CATALOGUE:
        score = 0
        reasons = []

        matched_crop = None
        for crop in crop_names:
            if "all" in s["crops"] or any(crop.lower() in sc.lower() for sc in s["crops"]):
                score += s["match_bonus"]
                matched_crop = crop
                break

        if matched_crop and "all" not in s["crops"]:
            reasons.append(f"Recommended for your {matched_crop} crop")
        elif matched_crop:
            reasons.append("Matches your active crop profile")

        if s["level"] == "state" and ("tamil nadu" in state.lower() or not state):
            score += 4
            loc_label = f"{district}, Tamil Nadu" if district else "Tamil Nadu"
            reasons.append(f"Priority State Scheme for {loc_label}")

        if s["type"] == "insurance":
            score += 2
            reasons.append("Crop loss protection")

        scored.append({
            "schemeId": s["id"],
            "name": s["name"],
            "score": score,
            "matchReason": " · ".join(reasons) if reasons else "Eligible Agricultural Support Scheme",
            "cropsMatched": [c for c in crop_names if any(c.lower() in sc.lower() for sc in s["crops"]) or "all" in s["crops"]]
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    return {
        "farmerDistrict": district,
        "farmerState": state,
        "farmerCrops": crop_names,
        "recommendations": scored
    }


# ---------------- AI Assistant ----------------

@app.post("/api/assistant")
async def talk_to_ai(req: schemas.AssistantMessage):

    reply = await ai_service.ask_assistant(req.message, req.language)

    return {"reply": reply}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)