from pydantic import BaseModel

class Transaction(BaseModel):
    sender_email: str
    receiver_email: str
    amount: float
