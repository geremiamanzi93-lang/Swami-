import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Header, Request, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Cuore Artigiano API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "cuore_artigiano")
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    brand_name: Optional[str] = None
    bio: Optional[str] = None
    whatsapp: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class Work(BaseModel):
    work_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    category: str
    image_path: str
    image_paths: List[str] = []
    artisan_name: str
    artisan_whatsapp: Optional[str] = None
    artisan_picture: Optional[str] = None
    likes_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

# Auth Helper (Simplified for demonstration)
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    token = authorization.replace("Bearer ", "")
    # Here we would normally verify the token with Emergent Auth
    # For now, we'll look up a session in MongoDB
    session = await db.user_sessions.find_one({"session_token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user = await db.users.find_one({"user_id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Endpoints
@app.get("/api")
async def health_check():
    return {"status": "ok", "message": "Cuore Artigiano API is running"}

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@app.post("/api/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization:
        token = authorization.replace("Bearer ", "")
        await db.user_sessions.delete_one({"session_token": token})
    return {"status": "success"}

@app.get("/api/works")
async def get_works(category: Optional[str] = None, user_id: Optional[str] = None):
    query = {}
    if category and category != "Tutti":
        query["category"] = category
    if user_id:
        query["user_id"] = user_id
    
    cursor = db.works.find(query).sort("created_at", -1)
    works = await cursor.to_list(length=100)
    # Convert MongoDB _id to string or remove it
    for work in works:
        work["id"] = str(work.pop("_id"))
    return works

@app.get("/api/works/{work_id}")
async def get_work(work_id: str):
    work = await db.works.find_one({"work_id": work_id})
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    work["id"] = str(work.pop("_id"))
    return work

@app.post("/api/works", status_code=201)
async def create_work(work_data: dict, user: dict = Depends(get_current_user)):
    new_work = {
        "work_id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "title": work_data["title"],
        "description": work_data["description"],
        "category": work_data["category"],
        "image_path": work_data["image_path"],
        "image_paths": work_data.get("image_paths", [work_data["image_path"]]),
        "artisan_name": user.get("brand_name") or user.get("name"),
        "artisan_whatsapp": user.get("whatsapp"),
        "artisan_picture": user.get("profile_image") or user.get("picture"),
        "likes_count": 0,
        "created_at": datetime.now()
    }
    result = await db.works.insert_one(new_work)
    new_work["id"] = str(result.inserted_id)
    return new_work

@app.get("/api/profile/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    return user

@app.put("/api/profile/me")
async def update_my_profile(profile_data: dict, user: dict = Depends(get_current_user)):
    update_fields = {k: v for k, v in profile_data.items() if k in ["brand_name", "bio", "whatsapp", "profile_image"]}
    if not update_fields:
        return user
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": update_fields}
    )
    
    # Also update artisan info in all their works
    work_updates = {}
    if "brand_name" in update_fields:
        work_updates["artisan_name"] = update_fields["brand_name"]
    if "whatsapp" in update_fields:
        work_updates["artisan_whatsapp"] = update_fields["whatsapp"]
    if "profile_image" in update_fields:
        work_updates["artisan_picture"] = update_fields["profile_image"]
    
    if work_updates:
        await db.works.update_many(
            {"user_id": user["user_id"]},
            {"$set": work_updates}
        )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]})
    return updated_user

@app.get("/api/profile/{user_id}")
async def get_profile(user_id: str):
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    # Don't return sensitive info if any
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "brand_name": user.get("brand_name"),
        "bio": user.get("bio"),
        "whatsapp": user.get("whatsapp"),
        "profile_image": user.get("profile_image"),
        "picture": user.get("picture")
    }

@app.get("/api/likes/my")
async def get_my_likes(user: dict = Depends(get_current_user)):
    likes = await db.likes.find({"user_id": user["user_id"]}).to_list(length=1000)
    return [like["work_id"] for like in likes]

@app.post("/api/works/{work_id}/like")
async def toggle_like(work_id: str, user: dict = Depends(get_current_user)):
    existing_like = await db.likes.find_one({"user_id": user["user_id"], "work_id": work_id})
    
    if existing_like:
        await db.likes.delete_one({"_id": existing_like["_id"]})
        await db.works.update_one({"work_id": work_id}, {"$inc": {"likes_count": -1}})
        return {"liked": False}
    else:
        await db.likes.insert_one({
            "user_id": user["user_id"],
            "work_id": work_id,
            "created_at": datetime.now()
        })
        await db.works.update_one({"work_id": work_id}, {"$inc": {"likes_count": 1}})
        return {"liked": True}

@app.get("/api/search/artisans")
async def search_artisans(q: str):
    if not q:
        return []
    
    cursor = db.users.find({
        "$or": [
            {"brand_name": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}}
        ]
    }).limit(20)
    
    artisans = await cursor.to_list(length=20)
    return [
        {
            "user_id": a["user_id"],
            "name": a["name"],
            "brand_name": a.get("brand_name"),
            "profile_image": a.get("profile_image"),
            "picture": a.get("picture")
        }
        for a in artisans
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
