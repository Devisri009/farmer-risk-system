"""
API Router for AI Direct Buyer Matching & Collective Supply Contracts
"""

import json
import time
import hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..services import matching_service

router = APIRouter()


# ─── Initial Seeder for Demo Institutional Demands ──────────────────────────────
def _ensure_initial_demands_seeded(db: Session):
    existing_count = db.query(models.BuyerDemand).count()
    if existing_count == 0:
        # Create or find a default institutional buyer user
        buyer_user = db.query(models.User).filter(models.User.role == "retailer").first()
        buyer_id = buyer_user.id if buyer_user else 1
        buyer_name = buyer_user.name if buyer_user else "Reliance Fresh Retail Hub"

        demo_demands = [
            models.BuyerDemand(
                buyer_id=buyer_id,
                buyer_name="Fresho Mega Supermarkets",
                buyer_category="Supermarkets",
                crop_name="Tomato",
                target_quantity_kg=2500.0,
                max_price_per_kg=24.0,
                frequency="Weekly",
                delivery_location="Madurai Distribution Center",
                delivery_district="Madurai",
                delivery_deadline="Next Tuesday, 6:00 AM",
                notes="Grade A fresh harvest needed. Direct cold-chain vehicle pickup at aggregation point.",
                status="Pending"
            ),
            models.BuyerDemand(
                buyer_id=buyer_id,
                buyer_name="Aachi Spices & Foods Ltd",
                buyer_category="Food-Processing",
                crop_name="Turmeric",
                target_quantity_kg=5000.0,
                max_price_per_kg=150.0,
                frequency="Monthly",
                delivery_location="Erode Processing Plant",
                delivery_district="Erode",
                delivery_deadline="End of Month",
                notes="Curcumin content > 3.5% preferred. Dry cured finger turmeric.",
                status="Pending"
            ),
            models.BuyerDemand(
                buyer_id=buyer_id,
                buyer_name="Southern Agro Exporters",
                buyer_category="Exporters",
                crop_name="Banana",
                target_quantity_kg=3000.0,
                max_price_per_kg=48.0,
                frequency="Bi-Weekly",
                delivery_location="Tuticorin Port Logistics Hub",
                delivery_district="Thoothukudi",
                delivery_deadline="Friday Evening",
                notes="G9 Cavendish variety. Uniform green grading for Gulf export consignment.",
                status="Pending"
            ),
            models.BuyerDemand(
                buyer_id=buyer_id,
                buyer_name="Grand Chola Hotel Chain",
                buyer_category="Restaurants & Hotels",
                crop_name="Onion",
                target_quantity_kg=1500.0,
                max_price_per_kg=38.0,
                frequency="Weekly",
                delivery_location="Chennai Central Kitchen",
                delivery_district="Chennai",
                delivery_deadline="Every Monday",
                notes="Medium size Bellary/Dindigul onions with low moisture.",
                status="Pending"
            ),
            models.BuyerDemand(
                buyer_id=buyer_id,
                buyer_name="Tamil Nadu Civil Supplies Corp",
                buyer_category="Government/Institutional",
                crop_name="Paddy",
                target_quantity_kg=10000.0,
                max_price_per_kg=26.0,
                frequency="One-Time",
                delivery_location="Thanjavur Direct Purchase Centre",
                delivery_district="Thanjavur",
                delivery_deadline="Immediate Procurement",
                notes="MSP assured institutional purchase for state reserve buffer.",
                status="Pending"
            ),
        ]
        db.add_all(demo_demands)
        db.commit()


# ─── Buyer Endpoints ────────────────────────────────────────────────────────────

@router.post("/buyer/demands", response_model=schemas.BuyerDemandResponse)
def create_buyer_demand(
    demand_in: schemas.BuyerDemandCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Buyers/Retailers post bulk recurring or one-time procurement demands."""
    db_demand = models.BuyerDemand(
        buyer_id=current_user.id,
        buyer_name=current_user.name or current_user.username,
        buyer_category=demand_in.buyer_category,
        crop_name=demand_in.crop_name.strip().title(),
        target_quantity_kg=demand_in.target_quantity_kg,
        max_price_per_kg=demand_in.max_price_per_kg,
        frequency=demand_in.frequency,
        delivery_location=demand_in.delivery_location,
        delivery_district=demand_in.delivery_district or current_user.district,
        delivery_deadline=demand_in.delivery_deadline,
        notes=demand_in.notes,
        status="Pending"
    )
    db.add(db_demand)
    db.commit()
    db.refresh(db_demand)

    # Immediately trigger matching engine to see if existing farmer pool satisfies demand
    matching_service.find_and_create_matches(db_demand.id, db)
    db.refresh(db_demand)

    return db_demand


@router.get("/buyer/demands", response_model=List[schemas.BuyerDemandResponse])
def get_buyer_demands(
    category: Optional[str] = None,
    crop: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Public/Farmer query of all active verified buyer demands."""
    _ensure_initial_demands_seeded(db)
    query = db.query(models.BuyerDemand).order_by(models.BuyerDemand.created_at.desc())
    if category and category != "All":
        query = query.filter(models.BuyerDemand.buyer_category == category)
    if crop and crop != "All":
        query = query.filter(models.BuyerDemand.crop_name.ilike(f"%{crop}%"))
    return query.all()


# ─── Farmer Supply Pool Endpoints ───────────────────────────────────────────────

@router.post("/farmer/supply-pool", response_model=schemas.FarmerSupplyPoolResponse)
def enroll_in_supply_pool(
    pool_in: schemas.FarmerSupplyPoolCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Farmer enrolls a harvest/crop batch into the direct aggregation pool."""
    db_entry = models.FarmerSupplyPool(
        farmer_id=current_user.id,
        farmer_name=current_user.name,
        crop_id=pool_in.crop_id,
        crop_name=pool_in.crop_name.strip().title(),
        available_quantity_kg=pool_in.available_quantity_kg,
        min_price_per_kg=pool_in.min_price_per_kg,
        location=pool_in.location or f"{current_user.village or ''}, {current_user.district or 'Madurai'}",
        district=pool_in.district or current_user.district or "Madurai",
        state=pool_in.state or current_user.state or "Tamil Nadu",
        latitude=current_user.latitude,
        longitude=current_user.longitude,
        harvest_date=pool_in.harvest_date,
        quality_grade=pool_in.quality_grade,
        status="Available"
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    # Trigger matching against all pending demands for this crop
    pending_demands = db.query(models.BuyerDemand).filter(
        models.BuyerDemand.status == "Pending",
        models.BuyerDemand.crop_name.ilike(f"%{db_entry.crop_name}%")
    ).all()

    for d in pending_demands:
        matching_service.find_and_create_matches(d.id, db)

    db.refresh(db_entry)
    return db_entry


@router.get("/farmer/supply-pool", response_model=List[schemas.FarmerSupplyPoolResponse])
def get_my_supply_pool(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Farmer lists their current supply pool enrollments."""
    return db.query(models.FarmerSupplyPool).filter(
        models.FarmerSupplyPool.farmer_id == current_user.id
    ).order_by(models.FarmerSupplyPool.created_at.desc()).all()


@router.get("/supply-pool", response_model=List[schemas.FarmerSupplyPoolResponse])
def get_public_supply_pool(
    crop: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Public/Consumer query of active farmer supply pool listings."""
    query = db.query(models.FarmerSupplyPool).filter(
        models.FarmerSupplyPool.status == "Available"
    ).order_by(models.FarmerSupplyPool.created_at.desc())

    if crop and crop != "All":
        query = query.filter(models.FarmerSupplyPool.crop_name.ilike(f"%{crop}%"))
    if district and district != "All":
        query = query.filter(models.FarmerSupplyPool.district.ilike(f"%{district}%"))

    return query.all()


# ─── Matching Trigger & Contract Operations ────────────────────────────────────

@router.post("/trigger/{demand_id}", response_model=Optional[schemas.AggregatedContractResponse])
def trigger_matching(demand_id: int, db: Session = Depends(get_db)):
    """Manually triggers the aggregation algorithm for a specific buyer demand."""
    contract = matching_service.find_and_create_matches(demand_id, db)
    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Matching threshold not met. Not enough nearby supply pool volume yet."
        )

    allocations = json.loads(contract.farmer_allocations_json or "[]")
    return schemas.AggregatedContractResponse(
        id=contract.id,
        demand_id=contract.demand_id,
        buyer_id=contract.buyer_id,
        buyer_name=contract.buyer_name,
        buyer_category=contract.buyer_category,
        crop_name=contract.crop_name,
        total_quantity_kg=float(contract.total_quantity_kg),
        agreed_price_per_kg=float(contract.agreed_price_per_kg),
        total_contract_value=float(contract.total_contract_value),
        delivery_location=contract.delivery_location,
        delivery_deadline=contract.delivery_deadline,
        status=contract.status,
        farmer_allocations=allocations,
        blockchain_contract_tx=contract.blockchain_contract_tx,
        created_at=contract.created_at
    )


@router.get("/contracts", response_model=List[schemas.AggregatedContractResponse])
def get_user_contracts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Retrieves all aggregated contracts involving the current farmer or buyer."""
    all_contracts = db.query(models.AggregatedContract).order_by(
        models.AggregatedContract.created_at.desc()
    ).all()

    user_contracts = []
    for c in all_contracts:
        allocations = json.loads(c.farmer_allocations_json or "[]")
        is_involved_farmer = any(a.get("farmer_id") == current_user.id for a in allocations)
        is_buyer = (c.buyer_id == current_user.id) or (current_user.role in ["consumer", "retailer"])

        if is_involved_farmer or is_buyer or current_user.role in ["farmer", "consumer", "retailer"]:
            user_contracts.append(
                schemas.AggregatedContractResponse(
                    id=c.id,
                    demand_id=c.demand_id,
                    buyer_id=c.buyer_id,
                    buyer_name=c.buyer_name,
                    buyer_category=c.buyer_category,
                    crop_name=c.crop_name,
                    total_quantity_kg=float(c.total_quantity_kg),
                    agreed_price_per_kg=float(c.agreed_price_per_kg),
                    total_contract_value=float(c.total_contract_value),
                    delivery_location=c.delivery_location,
                    delivery_deadline=c.delivery_deadline,
                    status=c.status,
                    farmer_allocations=allocations,
                    blockchain_contract_tx=c.blockchain_contract_tx,
                    created_at=c.created_at
                )
            )

    return user_contracts


@router.patch("/contracts/{contract_id}/confirm", response_model=schemas.AggregatedContractResponse)
def confirm_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Confirms/executes an aggregated supply contract."""
    contract = db.query(models.AggregatedContract).filter(
        models.AggregatedContract.id == contract_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract.status = "Confirmed"
    contract.blockchain_contract_tx = "0x" + hashlib.sha256(f"contract_{contract.id}_{time.time()}".encode()).hexdigest()[:40]

    # Update demand status
    demand = db.query(models.BuyerDemand).filter(models.BuyerDemand.id == contract.demand_id).first()
    if demand:
        demand.status = "Confirmed"

    db.commit()
    db.refresh(contract)

    allocations = json.loads(contract.farmer_allocations_json or "[]")
    return schemas.AggregatedContractResponse(
        id=contract.id,
        demand_id=contract.demand_id,
        buyer_id=contract.buyer_id,
        buyer_name=contract.buyer_name,
        buyer_category=contract.buyer_category,
        crop_name=contract.crop_name,
        total_quantity_kg=float(contract.total_quantity_kg),
        agreed_price_per_kg=float(contract.agreed_price_per_kg),
        total_contract_value=float(contract.total_contract_value),
        delivery_location=contract.delivery_location,
        delivery_deadline=contract.delivery_deadline,
        status=contract.status,
        farmer_allocations=allocations,
        blockchain_contract_tx=contract.blockchain_contract_tx,
        created_at=contract.created_at
    )
