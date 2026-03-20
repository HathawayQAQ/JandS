from pydantic import BaseModel, EmailStr


class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    country: str | None = None


class CustomerRead(CustomerCreate):
    id: int

    model_config = {"from_attributes": True}
