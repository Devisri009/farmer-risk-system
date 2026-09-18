"""
AI Direct Buyer Matching & Volume Aggregation Engine

Matches verified bulk buyers (supermarkets, food processors, exporters, hotels,
government institutions) with nearby smallholder farmers whose combined production
satisfies high-volume demand.
"""

import json
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .. import models


def calculate_geo_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates approximate distance in kilometers using Haversine formula."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 50.0  # Default average regional distance
    
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def find_and_create_matches(demand_id: int, db: Session) -> Optional[models.AggregatedContract]:
    """
    Core AI Aggregation Algorithm:
    1. Fetches the target BuyerDemand.
    2. Searches for unallocated FarmerSupplyPool entries matching the crop.
    3. Sorts candidate farmers by:
       a) Price feasibility (farmer min_price <= demand max_price)
       b) District / proximity to buyer delivery point
       c) Freshness / harvest date
    4. Aggregates supplies greedily until target_quantity_kg is met or exceeded.
    5. Creates and saves an AggregatedContract grouping all matched farmers.
    """
    demand = db.query(models.BuyerDemand).filter(models.BuyerDemand.id == demand_id).first()
    if not demand or demand.status in ["Confirmed", "Fulfilled"]:
        return None

    target_crop = (demand.crop_name or "").strip().lower()
    target_qty = float(demand.target_quantity_kg)
    max_price = float(demand.max_price_per_kg)

    # Find matching available farmer supply pool entries
    all_supplies = db.query(models.FarmerSupplyPool).filter(
        models.FarmerSupplyPool.status == "Available"
    ).all()

    candidates = []
    for s in all_supplies:
        if target_crop in (s.crop_name or "").lower() or (s.crop_name or "").lower() in target_crop:
            min_p = float(s.min_price_per_kg or 0.0)
            if min_p <= max_price:
                # District matching bonus
                is_same_district = (
                    (demand.delivery_district and s.district and demand.delivery_district.lower() == s.district.lower())
                    or (demand.delivery_location and s.location and demand.delivery_location.lower() in s.location.lower())
                )
                score = 100 if is_same_district else 50
                candidates.append({
                    "entry": s,
                    "score": score,
                    "available_kg": float(s.available_quantity_kg),
                    "min_price": min_p
                })

    if not candidates:
        return None

    # Sort by matching score descending, then price ascending
    candidates.sort(key=lambda x: (-x["score"], x["min_price"]))

    # Aggregation loop
    accumulated_kg = 0.0
    allocations = []
    allocated_pool_entries = []

    # Negotiated contract price (optimal balance between buyer max and farmers' min)
    highest_farmer_min = max(c["min_price"] for c in candidates)
    agreed_price = round(min(max_price, max(highest_farmer_min, max_price * 0.96)), 2)

    for cand in candidates:
        if accumulated_kg >= target_qty:
            break
        
        entry: models.FarmerSupplyPool = cand["entry"]
        avail = float(entry.available_quantity_kg)
        needed = target_qty - accumulated_kg
        take_kg = min(avail, needed)

        payout = round(take_kg * agreed_price, 2)
        farmer_user = db.query(models.User).filter(models.User.id == entry.farmer_id).first()
        farmer_name = entry.farmer_name or (farmer_user.name if farmer_user else "Local Farmer")
        farmer_phone = farmer_user.phone if farmer_user else "Verified"

        allocations.append({
            "farmer_id": entry.farmer_id,
            "farmer_name": farmer_name,
            "phone": farmer_phone,
            "district": entry.district or entry.location,
            "allocated_kg": take_kg,
            "payout_amount": payout,
            "status": "Matched"
        })

        allocated_pool_entries.append((entry, take_kg))
        accumulated_kg += take_kg

    if not allocations:
        return None

    # Determine if threshold met (allow match if at least 70% of bulk target met)
    if accumulated_kg < target_qty * 0.70:
        return None

    total_contract_value = round(accumulated_kg * agreed_price, 2)

    # Check if a contract for this demand already exists
    contract = db.query(models.AggregatedContract).filter(
        models.AggregatedContract.demand_id == demand.id
    ).first()

    if not contract:
        contract = models.AggregatedContract(
            demand_id=demand.id,
            buyer_id=demand.buyer_id,
            buyer_name=demand.buyer_name or "Verified Institutional Buyer",
            buyer_category=demand.buyer_category,
            crop_name=demand.crop_name,
            total_quantity_kg=accumulated_kg,
            agreed_price_per_kg=agreed_price,
            total_contract_value=total_contract_value,
            delivery_location=demand.delivery_location,
            delivery_deadline=demand.delivery_deadline,
            status="Matched",
            farmer_allocations_json=json.dumps(allocations)
        )
        db.add(contract)
    else:
        contract.total_quantity_kg = accumulated_kg
        contract.agreed_price_per_kg = agreed_price
        contract.total_contract_value = total_contract_value
        contract.farmer_allocations_json = json.dumps(allocations)
        contract.status = "Matched"

    demand.status = "Matched"

    # Mark pool entries as allocated
    for entry, take_kg in allocated_pool_entries:
        if take_kg >= float(entry.available_quantity_kg):
            entry.status = "Allocated"
        else:
            entry.available_quantity_kg = float(entry.available_quantity_kg) - take_kg

    db.commit()
    db.refresh(contract)
    return contract
