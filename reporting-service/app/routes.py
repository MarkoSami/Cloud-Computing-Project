from fastapi import APIRouter
from app.database import transactions_collection

router = APIRouter()

@router.get("/summary/{email}")
def user_summary(email: str):
    sent = transactions_collection.aggregate([
        {"$match": {"sender": email}},
        {"$group": {"_id": "$sender", "total_sent": {"$sum": "$amount"}}}
    ])
    
    received = transactions_collection.aggregate([
        {"$match": {"receiver": email}},
        {"$group": {"_id": "$receiver", "total_received": {"$sum": "$amount"}}}
    ])

    total_sent = next(sent, {}).get("total_sent", 0)
    total_received = next(received, {}).get("total_received", 0)

    return {
        "email": email,
        "total_sent": total_sent,
        "total_received": total_received
    }
