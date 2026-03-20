import enum

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class TourOffice(str, enum.Enum):
    CANADA = "canada"
    US = "us"
    BOTH = "both"


class Tour(Base, TimestampMixin):
    __tablename__ = "tours"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    duration_hours: Mapped[float] = mapped_column(nullable=False)
    max_seats: Mapped[int] = mapped_column(Integer, nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "minibus", "coach"
    departure_office: Mapped[TourOffice] = mapped_column(
        Enum(TourOffice), nullable=False, default=TourOffice.BOTH
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    stops: Mapped[list["TourStop"]] = relationship(
        back_populates="tour", order_by="TourStop.order", cascade="all, delete-orphan"
    )
    pricing_rules: Mapped[list["PricingRule"]] = relationship(back_populates="tour", cascade="all, delete-orphan")
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="tour")


class TourStop(Base):
    __tablename__ = "tour_stops"

    id: Mapped[int] = mapped_column(primary_key=True)
    tour_id: Mapped[int] = mapped_column(ForeignKey("tours.id"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    duration_minutes: Mapped[int | None] = mapped_column(Integer)

    tour: Mapped["Tour"] = relationship(back_populates="stops")
