"""
Seed the two J&S office records.
Run once after the initial migration:
    python -m app.seeds.offices
"""

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.models.office import Office, OfficeCountry
import os

DATABASE_URL = os.environ["DATABASE_URL"]

OFFICES = [
    Office(
        country=OfficeCountry.US,
        street_number="8016",
        street_name="W Rivershore Dr",
        city="Niagara Falls",
        state_province="NY",
        postal_code="14304",
        phone="347-348-7777",
    ),
    Office(
        country=OfficeCountry.CA,
        street_number="5087",
        street_name="14th Ave",
        city="Markham",
        state_province="ON",
        postal_code="L3S 3K4",
        phone="347-348-7777",
    ),
]


async def seed(session: AsyncSession) -> None:
    for office in OFFICES:
        exists = (
            await session.execute(
                select(Office).where(Office.country == office.country)
            )
        ).scalar_one_or_none()
        if not exists:
            session.add(office)
    await session.commit()
    print("Offices seeded.")


async def main() -> None:
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        await seed(session)


if __name__ == "__main__":
    asyncio.run(main())
