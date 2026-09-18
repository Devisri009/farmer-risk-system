"""
Smart Market Price Simulation for Tamil Nadu Mandis.

Prices change daily using the current date as a seed so they look live
but never require an external API. Seasonal patterns are modelled after
real Tamil Nadu agricultural calendar data.
"""

import json
import hashlib
import random
import datetime
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ..models.market import MarketCache
from ..schemas.market_schema import MandiPrice, MarketDemand
from typing import List, Optional, Dict, Any

load_dotenv()

# ── Cache settings ─────────────────────────────────────────────────────────────
CACHE_EXPIRY_SECONDS = 3600  # 1 hour (prices update once per day anyway)

# ── Tamil Nadu crop catalogue ───────────────────────────────────────────────────
# Each entry: (crop_name, base_price, unit, primary_mandi, seasonal_months_peak)
# seasonal_months_peak → tuple of months (1-12) where price is highest
# Prices are in ₹ per unit (quintal / kg as stated)
CROP_CATALOGUE = [
    # Crop              Base ₹   Unit        Primary Mandi    Peak months
    ("Paddy",           2300,    "quintal",  "Thanjavur",     (11, 12, 1, 2, 7, 8)),
    ("Turmeric",        14500,   "quintal",  "Erode",         (1, 2, 3)),
    ("Cotton",          7200,    "quintal",  "Tirupur",       (10, 11, 12)),
    ("Tomato",          22,      "kg",       "Coimbatore",    (11, 12, 1, 2)),
    ("Onion",           35,      "kg",       "Dindigul",      (5, 6, 7, 8)),
    ("Banana",          45,      "kg",       "Trichy",        (4, 5, 10, 11)),
    ("Chilly",          175,     "kg",       "Ramnad",        (4, 5, 6)),
    ("Groundnut",       6000,    "quintal",  "Vellore",       (11, 12, 1)),
    ("Maize",           2100,    "quintal",  "Salem",         (3, 4, 9, 10)),
    ("Sugarcane",       310,     "quintal",  "Madurai",       (11, 12, 1, 2)),
    ("Coconut",         2400,    "quintal",  "Coimbatore",    (1, 2, 10, 11)),
    ("Brinjal",         25,      "kg",       "Chennai",       (11, 12, 1)),
    ("Grapes",          90,      "kg",       "Theni",         (3, 4, 5)),
    ("Jasmine",         500,     "kg",       "Madurai",       (4, 5, 6, 10, 11)),
    ("Mango",           65,      "kg",       "Salem",         (4, 5, 6)),
    ("Tapioca",         1800,    "quintal",  "Namakkal",      (2, 3, 4)),
    ("Green Gram",      7800,    "quintal",  "Madurai",       (3, 4, 10, 11)),
    ("Black Gram",      7400,    "quintal",  "Trichy",        (3, 4, 10)),
]

# ── Seasonal multiplier ─────────────────────────────────────────────────────────
def _seasonal_multiplier(peak_months: tuple, current_month: int) -> float:
    """Returns a value between 0.85 (low season) and 1.15 (peak season)."""
    if current_month in peak_months:
        return 1.10
    # Adjacent to peak month?
    adjacent = {(m % 12) + 1 for m in peak_months} | {(m - 2) % 12 + 1 for m in peak_months}
    if current_month in adjacent:
        return 1.04
    return 0.88


# ── Date-seeded price generator ─────────────────────────────────────────────────
def _day_seed(offset_days: int = 0) -> int:
    """Stable integer seed from (today + offset) so prices are consistent within a day."""
    target = datetime.date.today() + datetime.timedelta(days=offset_days)
    return int(hashlib.md5(target.isoformat().encode()).hexdigest(), 16) % (2 ** 31)


def _price_for_day(base: float, seasonal_mult: float, day_seed: int, crop_idx: int) -> float:
    """Compute price for a given day using seeded RNG — deterministic for the same date."""
    rng = random.Random(day_seed + crop_idx * 997)
    daily_noise = rng.uniform(-0.04, 0.04)  # ±4% daily noise
    return round(base * seasonal_mult * (1 + daily_noise))


def _compute_trend(today_price: float, yesterday_price: float) -> str:
    """Return a formatted trend string like '+45' or '-120'."""
    diff = round(today_price - yesterday_price)
    return f"+{diff}" if diff >= 0 else str(diff)


# ── Public service functions ────────────────────────────────────────────────────
def get_mandi_prices(db: Session, filters: Optional[Dict[str, Any]] = None) -> List[MandiPrice]:
    cache_key = "tn_smart_prices"
    cached = db.query(MarketCache).filter(MarketCache.key == cache_key).first()

    # Serve from cache if still fresh (uses today's prices, so 1 hour is fine)
    if cached:
        age = (datetime.datetime.now() - cached.updated_at).total_seconds()
        if age < CACHE_EXPIRY_SECONDS:
            print(f"[MARKET] Serving smart prices from cache (age={int(age)}s).")
            return [MandiPrice(**p) for p in json.loads(cached.data)]

    today_month = datetime.date.today().month
    today_seed = _day_seed(0)
    yest_seed = _day_seed(-1)

    prices: List[MandiPrice] = []
    for idx, (crop, base, unit, mandi, peak_months) in enumerate(CROP_CATALOGUE):
        mult = _seasonal_multiplier(peak_months, today_month)
        today_p = _price_for_day(base, mult, today_seed, idx)
        yest_p = _price_for_day(base, mult, yest_seed, idx)
        trend = _compute_trend(today_p, yest_p)
        prices.append(MandiPrice(crop=crop, price=today_p, unit=unit, trend=trend, mandi=mandi))

    # Cache the result
    serialized = json.dumps([p.dict() for p in prices])
    if cached:
        cached.data = serialized
        cached.updated_at = datetime.datetime.now()
    else:
        db.add(MarketCache(key=cache_key, data=serialized))
    db.commit()

    print(f"[MARKET] Generated {len(prices)} smart prices for {datetime.date.today()}.")
    return prices


def get_retailer_demands() -> List[MarketDemand]:
    """
    Retailer demands also vary daily using the same date-seed approach
    so they feel dynamic alongside the price data.
    """
    today_seed = _day_seed(0)
    rng = random.Random(today_seed + 1337)

    demand_pool = [
        ("Tomato",     "Chennai",    (1500, 3000), ("High", "High", "Medium")),
        ("Paddy",      "Madurai",    (3000, 8000), ("Medium", "High", "Medium")),
        ("Onion",      "Coimbatore", (800,  2000), ("High", "Medium", "High")),
        ("Turmeric",   "Erode",      (2000, 5000), ("Medium", "Low", "Medium")),
        ("Banana",     "Trichy",     (1000, 3000), ("High", "High", "Medium")),
        ("Green Gram", "Chennai",    (500,  1500), ("High", "Medium", "High")),
        ("Cotton",     "Tirupur",    (5000, 12000),("Medium", "High", "Medium")),
        ("Groundnut",  "Vellore",    (2000, 6000), ("Medium", "Medium", "High")),
    ]

    demands: List[MarketDemand] = []
    # Pick 5 different demands each day
    chosen = rng.sample(demand_pool, 5)
    for crop, city, qty_range, demand_choices in chosen:
        qty = rng.randint(*qty_range)
        demand_lvl = rng.choice(demand_choices)
        demands.append(MarketDemand(
            crop=crop,
            city=city,
            quantity=f"{qty} kg",
            demand=demand_lvl
        ))

    return demands


def get_7day_trend(crop: str, base_price: float) -> list:
    """Generate a 7-day price trend chart for the analytics modal."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_weekday = datetime.date.today().weekday()  # Mon=0, Sun=6
    today_month = datetime.date.today().month

    # Find the crop in catalogue for seasonal multiplier
    peak_months = (1, 12)  # generic fallback
    for name, base, unit, mandi, pm in CROP_CATALOGUE:
        if name.lower() == crop.lower():
            peak_months = pm
            break

    mult = _seasonal_multiplier(peak_months, today_month)
    trend_points = []
    for i, day in enumerate(days):
        offset = i - today_weekday  # negative = past days, 0 = today
        seed = _day_seed(offset)
        # Use index 999 as a unique key for trend data
        p = _price_for_day(base_price, mult, seed, 999 + i)
        trend_points.append({"day": day, "price": p})

    return trend_points
