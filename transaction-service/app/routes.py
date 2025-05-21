from fastapi import APIRouter, HTTPException
from app.models import Transaction
from app.database import transactions_collection, users_collection

router = APIRouter()

@router.post("/transfer")
def transfer_money(data: Transaction):
    sender = users_collection.find_one({"email": data.sender_email})
    receiver = users_collection.find_one({"email": data.receiver_email})

    if not sender or not receiver:
        raise HTTPException(status_code=404, detail="Sender or Receiver not found")

    if sender.get("balance", 0) < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # تحديث الأرصدة
    users_collection.update_one({"email": data.sender_email}, {"$inc": {"balance": -data.amount}})
    users_collection.update_one({"email": data.receiver_email}, {"$inc": {"balance": data.amount}})

    # تسجيل المعاملة
    transactions_collection.insert_one({
        "sender": data.sender_email,
        "receiver": data.receiver_email,
        "amount": data.amount
    })

    return {"msg": "Transfer successful"}
