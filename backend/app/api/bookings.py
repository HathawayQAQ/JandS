from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.reservation import Reservation
from app.schemas.booking import BookingRequest, BookingResponse, ReservationRead
from app.services.booking_service import BookingService
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(payload: BookingRequest, db: AsyncSession = Depends(get_db)):
    booking_service = BookingService(db)
    payment_service = PaymentService(db)

    try:
        reservation, total = await booking_service.create_booking(payload)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    session = await payment_service.create_checkout_session(
        reservation=reservation,
        amount_cad=total,
        success_url=(
            f"{settings.frontend_url}/bookings/{reservation.id}/success"
            "?session_id={CHECKOUT_SESSION_ID}"
        ),
        cancel_url=f"{settings.frontend_url}/bookings/{reservation.id}/cancel",
    )
    await db.commit()

    return BookingResponse(
        reservation_id=reservation.id,
        reference=reservation.reference,
        status=reservation.status,
        total_amount_cad=total,
        checkout_url=session.url,
    )


@router.get("/{reservation_id}", response_model=ReservationRead)
async def get_booking(reservation_id: int, db: AsyncSession = Depends(get_db)):
    reservation = await db.get(Reservation, reservation_id)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return reservation
