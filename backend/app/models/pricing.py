import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class PassengerType(str, enum.Enum):
    ADULT = "adult"
    CHILD = "child"
    SENIOR = "senior"


class PricingRule(Base, TimestampMixin):
    """
    Defines a price for a given tour, passenger type, and optional seasonal window.
    The most specific matching rule (narrowest date range) takes precedence.
    """

    __tablename__ = "pricing_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    tour_id: Mapped[int] = mapped_column(ForeignKey("tours.id"), nullable=False)
    passenger_type: Mapped[PassengerType] = mapped_column(Enum(PassengerType), nullable=False)
    price_cad: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    season_label: Mapped[str | None] = mapped_column(String(50))  # e.g. "peak", "off-peak"
    valid_from: Mapped[date | None] = mapped_column(Date)
    valid_until: Mapped[date | None] = mapped_column(Date)

    tour: Mapped["Tour"] = relationship(back_populates="pricing_rules")
