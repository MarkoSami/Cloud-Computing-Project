from fastapi import APIRouter, HTTPException, Depends
from app.models import UserRegister, UserLogin, UserResponse
from app.database import users_collection
from passlib.context import CryptContext
from bson import ObjectId

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@router.get("/")
def root():
    return {"msg": "User Service is running"}

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.post("/register", response_model=UserResponse)
def register(user: UserRegister):
    # Check if user already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create user document
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "balance": 1000  # Set initial balance
    }
    
    # Insert user into database
    result = users_collection.insert_one(user_data)
    
    # Return user data without password
    user_data["id"] = str(result.inserted_id)
    del user_data["password"]
    return user_data

@router.post("/login")
def login(user: UserLogin):
    # Find user by email
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"msg": f"Welcome {db_user['username']}"}

@router.get("/login")
def login_info():
    return {"msg": "Please use POST to log in"}