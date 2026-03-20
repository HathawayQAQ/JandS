import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"        # created, awaiting payment
    CONFIRMED = "confirmed"    # payment captured
    CANCELLED = "cancelled"
    COMPLETED = "completed"    # tour taken


class Reservation(Base, TimestampMixin):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # human-readable code
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    tour_id: Mapped[int] = mapped_column(ForeignKey("tours.id"), nullable=False)
    tour_date: Mapped[date] = mapped_column(Date, nullable=False)
    adults: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    children: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    seniors: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus), default=ReservationStatus.PENDING, nullable=False
    )
    special_requests: Mapped[str | None] = mapped_column(Text)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancel_reason: Mapped[str | None] = mapped_column(String(255))

    customer: Mapped["Customer"] = relationship(back_populates="reservations")
    tour: Mapped["Tour"] = relationship(back_populates="reservations")
    transaction: Mapped["Transaction | None"] = relationship(back_populates="reservation", uselist=False)

    @property
    def total_seats(self) -> int:
        return self.adults + self.children + self.seniors
