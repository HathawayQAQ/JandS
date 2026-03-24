from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.bookings import router as bookings_router
from app.api.payments import router as payments_router
from app.api.tours import router as tours_router

app = FastAPI(
    title="J&S Niagara Tours API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tours_router)
app.include_router(bookings_router)
app.include_router(payments_router)


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}
