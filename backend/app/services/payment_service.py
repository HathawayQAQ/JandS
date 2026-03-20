"""
Payment service — wraps Stripe (default) to create checkout sessions,
handle webhook events, and record transactions.

Swap the Stripe calls for any other gateway by implementing the same interface.
"""

import hashlib
import hmac
import json
import os
from decimal import Decimal

import stripe
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reservation import Reservation, ReservationStatus
from app.models.transaction import Transaction, TransactionStatus
from .booking_service import BookingService

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")


class PaymentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.booking = BookingService(db)

    async def create_checkout_session(
        self,
        reservation: Reservation,
        amount_cad: Decimal,
        success_url: str,
        cancel_url: str,
    ) -> stripe.checkout.Session:
        """
        Create a Stripe Checkout session for the given reservation.
        Returns the session so the caller can redirect the customer to session.url.
        """
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "cad",
                        "unit_amount": int(amount_cad * 100),  # cents
                        "product_data": {
                            "name": f"Tour Booking — {reservation.reference}",
                        },
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"reservation_id": str(reservation.id)},
        )

        # Record the pending transaction
        transaction = Transaction(
            reservation_id=reservation.id,
            gateway="stripe",
            gateway_payment_id=session.id,
            amount_cad=amount_cad,
            currency="CAD",
            status=TransactionStatus.PENDING,
        )
        self.db.add(transaction)
        await self.db.flush()

        return session

    def verify_webhook_signature(self, payload: bytes, sig_header: str) -> dict:
        """
        Verify the Stripe webhook signature and return the parsed event.
        Raises stripe.error.SignatureVerificationError on failure.
        """
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        return event

    async def handle_webhook(self, event: dict) -> None:
        """
        Dispatch incoming Stripe events to the appropriate handler.
        Unhandled event types are silently ignored.
        """
        handlers = {
            "checkout.session.completed": self._on_checkout_completed,
            "payment_intent.payment_failed": self._on_payment_failed,
            "charge.refunded": self._on_refunded,
        }
        handler = handlers.get(event["type"])
        if handler:
            await handler(event["data"]["object"])

    # ------------------------------------------------------------------
    # Private event handlers
    # ------------------------------------------------------------------

    async def _on_checkout_completed(self, session: dict) -> None:
        reservation_id = int(session["metadata"]["reservation_id"])

        transaction = await self._get_transaction_by_gateway_id(session["id"])
        if transaction:
            transaction.status = TransactionStatus.SUCCEEDED
            transaction.gateway_response = json.dumps(session)

        await self.booking.confirm_booking(reservation_id)

    async def _on_payment_failed(self, payment_intent: dict) -> None:
        transaction = await self._get_transaction_by_gateway_id(payment_intent["id"])
        if transaction:
            transaction.status = TransactionStatus.FAILED
            transaction.failure_reason = payment_intent.get("last_payment_error", {}).get("message")
            transaction.gateway_response = json.dumps(payment_intent)

    async def _on_refunded(self, charge: dict) -> None:
        payment_intent_id = charge.get("payment_intent")
        transaction = await self._get_transaction_by_gateway_id(payment_intent_id)
        if transaction:
            transaction.status = TransactionStatus.REFUNDED
            transaction.gateway_response = json.dumps(charge)

            reservation = await self.db.get(Reservation, transaction.reservation_id)
            if reservation:
                await self.booking.cancel_booking(reservation.id, reason="refunded")

    async def _get_transaction_by_gateway_id(self, gateway_id: str) -> Transaction | None:
        from sqlalchemy import select

        stmt = select(Transaction).where(Transaction.gateway_payment_id == gateway_id)
        return (await self.db.execute(stmt)).scalar_one_or_none()
