from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pricing import PassengerType, PricingRule


class PricingService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_price(
        self,
        tour_id: int,
        passenger_type: PassengerType,
        travel_date: date,
    ) -> Decimal:
        """
        Return the applicable price for a passenger type on a given date.
        Prefers the most specific rule (narrowest valid date window).
        Falls back to rules with no date constraints.
        """
        stmt = (
            select(PricingRule)
            .where(
                PricingRule.tour_id == tour_id,
                PricingRule.passenger_type == passenger_type,
            )
            .order_by(
                # Narrower windows rank higher than open-ended ones
                PricingRule.valid_from.desc().nulls_last(),
                PricingRule.valid_until.asc().nulls_last(),
            )
        )
        result = await self.db.execute(stmt)
        rules = result.scalars().all()

        for rule in rules:
            in_window = (rule.valid_from is None or rule.valid_from <= travel_date) and (
                rule.valid_until is None or travel_date <= rule.valid_until
            )
            if in_window:
                return rule.price_cad

        raise ValueError(
            f"No pricing rule found for tour {tour_id}, "
            f"passenger type '{passenger_type}', date {travel_date}"
        )

    async def calculate_total(
        self,
        tour_id: int,
        travel_date: date,
        adults: int,
        children: int,
        seniors: int,
    ) -> Decimal:
        adult_price = await self.get_price(tour_id, PassengerType.ADULT, travel_date)
        child_price = await self.get_price(tour_id, PassengerType.CHILD, travel_date)
        senior_price = await self.get_price(tour_id, PassengerType.SENIOR, travel_date)

        return (
            adult_price * adults
            + child_price * children
            + senior_price * seniors
        )
