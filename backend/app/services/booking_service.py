import secrets
import string
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.reservation import Reservation, ReservationStatus
from app.models.tour import Tour
from app.schemas.booking import AvailabilityResponse, BookingRequest
from .pricing_service import PricingService


def _generate_reference(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


class BookingService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.pricing = PricingService(db)

    async def get_availability(self, tour_id: int, tour_date: date) -> AvailabilityResponse:
        tour = await self.db.get(Tour, tour_id)
        if tour is None:
            raise ValueError(f"Tour {tour_id} not found")

        stmt = select(func.sum(Reservation.adults + Reservation.children + Reservation.seniors)).where(
            Reservation.tour_id == tour_id,
            Reservation.tour_date == tour_date,
            Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
        )
        seats_booked = (await self.db.execute(stmt)).scalar() or 0

        return AvailabilityResponse(
            tour_id=tour_id,
            tour_date=tour_date,
            max_seats=tour.max_seats,
            seats_booked=seats_booked,
            seats_available=max(0, tour.max_seats - seats_booked),
        )

    async def create_booking(self, payload: BookingRequest) -> tuple[Reservation, float]:
        """
        Validate availability, upsert customer, create a PENDING reservation,
        and return (reservation, total_amount_cad).
        """
        availability = await self.get_availability(payload.tour_id, payload.tour_date)
        requested = payload.adults + payload.children + payload.seniors
        if requested > availability.seats_available:
            raise ValueError(
                f"Only {availability.seats_available} seat(s) available on {payload.tour_date}"
            )

        # Upsert customer by email
        stmt = select(Customer).where(Customer.email == payload.customer.email)
        customer = (await self.db.execute(stmt)).scalar_one_or_none()
        if customer is None:
            customer = Customer(**payload.customer.model_dump())
            self.db.add(customer)
            await self.db.flush()

        total = await self.pricing.calculate_total(
            payload.tour_id,
            payload.tour_date,
            payload.adults,
            payload.children,
            payload.seniors,
        )

        reservation = Reservation(
            reference=_generate_reference(),
            customer_id=customer.id,
            tour_id=payload.tour_id,
            tour_date=payload.tour_date,
            adults=payload.adults,
            children=payload.children,
            seniors=payload.seniors,
            special_requests=payload.special_requests,
            status=ReservationStatus.PENDING,
        )
        self.db.add(reservation)
        await self.db.flush()

        return reservation, total

    async def confirm_booking(self, reservation_id: int) -> Reservation:
        reservation = await self.db.get(Reservation, reservation_id)
        if reservation is None:
            raise ValueError(f"Reservation {reservation_id} not found")
        if reservation.status != ReservationStatus.PENDING:
            raise ValueError(f"Reservation is already {reservation.status}")
        reservation.status = ReservationStatus.CONFIRMED
        return reservation

    async def cancel_booking(self, reservation_id: int, reason: str | None = None) -> Reservation:
        reservation = await self.db.get(Reservation, reservation_id)
        if reservation is None:
            raise ValueError(f"Reservation {reservation_id} not found")
        if reservation.status == ReservationStatus.CANCELLED:
            raise ValueError("Reservation is already cancelled")
        reservation.status = ReservationStatus.CANCELLED
        reservation.cancelled_at = datetime.now(timezone.utc)
        reservation.cancel_reason = reason
        return reservation
