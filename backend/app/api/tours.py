from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.tour import Tour
from app.schemas.booking import AvailabilityResponse
from app.schemas.tour import TourRead
from app.services.booking_service import BookingService

router = APIRouter(prefix="/tours", tags=["tours"])


@router.get("", response_model=list[TourRead])
async def list_tours(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Tour)
        .where(Tour.is_active.is_(True))
        .options(selectinload(Tour.stops), selectinload(Tour.pricing_rules))
        .order_by(Tour.name)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{tour_id}", response_model=TourRead)
async def get_tour(tour_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Tour)
        .where(Tour.id == tour_id)
        .options(selectinload(Tour.stops), selectinload(Tour.pricing_rules))
    )
    tour = (await db.execute(stmt)).scalar_one_or_none()
    if tour is None:
        raise HTTPException(status_code=404, detail="Tour not found")
    return tour


@router.get("/{tour_id}/availability", response_model=AvailabilityResponse)
async def get_availability(
    tour_id: int,
    date: date = Query(..., description="Tour date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
):
    service = BookingService(db)
    try:
        return await service.get_availability(tour_id, date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
