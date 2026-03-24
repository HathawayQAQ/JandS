import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/webhook", status_code=200)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
):
    payload = await request.body()
    service = PaymentService(db)

    try:
        event = service.verify_webhook_signature(payload, stripe_signature)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    await service.handle_webhook(event)
    await db.commit()

    return {"status": "ok"}
