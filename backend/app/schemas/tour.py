from decimal import Decimal

from pydantic import BaseModel

from app.models.tour import TourOffice
from app.models.pricing import PassengerType


class TourStopRead(BaseModel):
    order: int
    name: str
    description: str | None
    duration_minutes: int | None

    model_config = {"from_attributes": True}


class PricingRuleRead(BaseModel):
    passenger_type: PassengerType
    price_cad: Decimal
    season_label: str | None

    model_config = {"from_attributes": True}


class TourRead(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    duration_hours: float
    max_seats: int
    vehicle_type: str
    departure_office: TourOffice
    stops: list[TourStopRead]
    pricing_rules: list[PricingRuleRead]

    model_config = {"from_attributes": True}
