import enum

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class OfficeCountry(str, enum.Enum):
    CA = "CA"
    US = "US"


class Office(Base, TimestampMixin):
    __tablename__ = "offices"

    id: Mapped[int] = mapped_column(primary_key=True)
    country: Mapped[OfficeCountry] = mapped_column(nullable=False, unique=True)

    # Street
    street_number: Mapped[str] = mapped_column(String(20), nullable=False)
    street_name: Mapped[str] = mapped_column(String(200), nullable=False)

    # City / region
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state_province: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)

    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    @property
    def formatted_address(self) -> str:
        if self.country == OfficeCountry.US:
            # US format: 8016 W Rivershore Dr, Niagara Falls, NY 14304
            return (
                f"{self.street_number} {self.street_name}, "
                f"{self.city}, {self.state_province} {self.postal_code}"
            )
        # CA format: 5087 14th Ave, Markham, ON L3S 3K4
        return (
            f"{self.street_number} {self.street_name}, "
            f"{self.city}, {self.state_province}  {self.postal_code}"
        )
