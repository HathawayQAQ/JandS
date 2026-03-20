from pydantic import BaseModel


class PaymentInitResponse(BaseModel):
    checkout_url: str
    session_id: str


class WebhookPayload(BaseModel):
    """Raw payload forwarded from the payment gateway (e.g. Stripe)."""

    id: str          # gateway event ID
    type: str        # e.g. "payment_intent.succeeded"
    data: dict       # raw event data — validated downstream per event type
