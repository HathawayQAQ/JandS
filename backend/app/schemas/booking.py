from datetime import date
from decimal import Decimal

from pydantic import BaseModel, field_validator

from app.models.reservation import ReservationStatus
from .customer import CustomerCreate


class BookingRequest(BaseModel):
    tour_id: int
    tour_date: date
    adults: int = 1
    children: int = 0
    seniors: int = 0
    special_requests: str | None = None
    customer: CustomerCreate

    @field_validator("adults", "children", "seniors")
    @classmethod
    def non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Seat counts must be non-negative")
        return v

    @field_validator("seniors")  # runs after individual field validators
    @classmethod
    def at_least_one_passenger(cls, seniors: int, info) -> int:
        data = info.data
        total = data.get("adults", 0) + data.get("children", 0) + seniors
        if total < 1:
            raise ValueError("At least one passenger is required")
        return seniors


class BookingResponse(BaseModel):
    reservation_id: int
    reference: str
    status: ReservationStatus
    total_amount_cad: Decimal
    checkout_url: str  # redirect the user here to complete payment

    model_config = {"from_attributes": True}


class AvailabilityResponse(BaseModel):
    tour_id: int
    tour_date: date
    max_seats: int
    seats_booked: int
    seats_available: int
