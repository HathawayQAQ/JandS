import enum
from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"


class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    reservation_id: Mapped[int] = mapped_column(ForeignKey("reservations.id"), nullable=False, unique=True)
    gateway: Mapped[str] = mapped_column(String(50), nullable=False)          # e.g. "stripe"
    gateway_payment_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    amount_cad: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="CAD", nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False
    )
    gateway_response: Mapped[str | None] = mapped_column(Text)  # raw JSON from gateway
    failure_reason: Mapped[str | None] = mapped_column(String(255))

    reservation: Mapped["Reservation"] = relationship(back_populates="transaction")
