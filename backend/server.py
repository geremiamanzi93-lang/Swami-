from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Response, Header, Query, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import requests
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Object Storage Config
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get('APP_NAME', 'cuore-artigiano')
storage_key = None

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    brand_name: Optional[str] = None
    bio: Optional[str] = None
    whatsapp: Optional[str] = None
    profile_image: Optional[str] = None

class ProfileUpdate(BaseModel):
    brand_name: Optional[str] = None
    bio: Optional[str] = None
    whatsapp: Optional[str] = None
    profile_image: Optional[str] = None

class WorkCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    image_path: Optional[str] = None
    image_paths: Optional[List[str]] = None

class WorkResponse(BaseModel):
    work_id: str
    user_id: str
    title: str
    description: Optional[str] = None
    category: str
    image_path: str
    image_paths: Optional[List[str]] = None
    created_at: str
    artisan_name: Optional[str] = None
    artisan_picture: Optional[str] = None
    artisan_whatsapp: Optional[str] = None

class WorkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class LikeResponse(BaseModel):
    work_id: str
    liked: bool
    total_likes: int

# ==================== STORAGE ====================

def init_storage():
    """Initialize object storage - call ONCE at startup."""
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload file to storage."""
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    """Download file from storage."""
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> dict:
    """Get current user from session token."""
    # Check cookie first, then Authorization header
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Non autenticato")
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Sessione non valida")
    
    # Check expiry
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sessione scaduta")
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utente non trovato")
    
    return user

async def get_optional_user(request: Request) -> Optional[dict]:
    """Get current user if authenticated, otherwise return None."""
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def exchange_session(request: Request):
    """Exchange session_id for user data and set cookie."""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id richiesto")
    
    # Call Emergent Auth to get user data
    try:
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=30
        )
        resp.raise_for_status()
        auth_data = resp.json()
    except Exception as e:
        logger.error(f"Auth session exchange failed: {e}")
        raise HTTPException(status_code=401, detail="Autenticazione fallita")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    email = auth_data["email"]
    session_token = auth_data["session_token"]
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data.get("name", existing_user.get("name")),
                "picture": auth_data.get("picture", existing_user.get("picture")),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new user
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": auth_data.get("name", ""),
            "picture": auth_data.get("picture", ""),
            "brand_name": "",
            "bio": "",
            "whatsapp": "",
            "profile_image": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Store session
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Get updated user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    # Include session_token in response body so frontend can store in localStorage
    user_response = dict(user)
    user_response["session_token"] = session_token
    
    response = JSONResponse(content=user_response)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    return response

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user."""
    user = await get_current_user(request)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request):
    """Logout user."""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response = JSONResponse(content={"message": "Logout effettuato"})
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return response

# ==================== PROFILE ENDPOINTS ====================

@api_router.get("/profile/me", response_model=UserResponse)
async def get_my_profile(request: Request):
    """Get current user's profile."""
    user = await get_current_user(request)
    return UserResponse(**user)

@api_router.put("/profile/me")
async def update_my_profile(profile: ProfileUpdate, request: Request):
    """Update current user's profile."""
    user = await get_current_user(request)
    
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return updated_user

@api_router.get("/profile/{user_id}", response_model=UserResponse)
async def get_profile(user_id: str):
    """Get a user's public profile."""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Profilo non trovato")
    return UserResponse(**user)

# ==================== WORKS ENDPOINTS ====================

@api_router.post("/works", response_model=WorkResponse)
async def create_work(work: WorkCreate, request: Request):
    """Create a new work."""
    user = await get_current_user(request)
    
    work_id = f"work_{uuid.uuid4().hex[:12]}"
    work_doc = {
        "work_id": work_id,
        "user_id": user["user_id"],
        "title": work.title,
        "description": work.description or "",
        "category": work.category,
        "image_path": work.image_paths[0] if work.image_paths else (work.image_path or ""),
        "image_paths": work.image_paths or ([work.image_path] if work.image_path else []),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_deleted": False
    }
    
    await db.works.insert_one(work_doc)
    
    return WorkResponse(
        **work_doc,
        artisan_name=user.get("brand_name") or user.get("name"),
        artisan_picture=user.get("profile_image") or user.get("picture"),
        artisan_whatsapp=user.get("whatsapp")
    )

@api_router.get("/works", response_model=List[WorkResponse])
async def get_works(category: Optional[str] = None, user_id: Optional[str] = None):
    """Get all works with optional filters."""
    query = {"is_deleted": False}
    if category and category != "Tutti":
        query["category"] = category
    if user_id:
        query["user_id"] = user_id
    
    # Use aggregation with $lookup to avoid N+1 queries
    pipeline = [
        {"$match": query},
        {"$sort": {"created_at": -1}},
        {"$limit": 1000},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "user_id",
            "as": "artisan"
        }},
        {"$unwind": {"path": "$artisan", "preserveNullAndEmptyArrays": True}},
        {"$project": {
            "_id": 0,
            "work_id": 1,
            "user_id": 1,
            "title": 1,
            "description": 1,
            "category": 1,
            "image_path": 1,
            "image_paths": 1,
            "created_at": 1,
            "artisan_name": {"$ifNull": [
                {"$cond": [{"$ne": ["$artisan.brand_name", ""]}, "$artisan.brand_name", "$artisan.name"]},
                "Artigiano"
            ]},
            "artisan_picture": {"$ifNull": [
                {"$cond": [{"$ne": ["$artisan.profile_image", ""]}, "$artisan.profile_image", "$artisan.picture"]},
                None
            ]},
            "artisan_whatsapp": {"$ifNull": ["$artisan.whatsapp", ""]}
        }}
    ]
    
    works = await db.works.aggregate(pipeline).to_list(1000)
    return [WorkResponse(**w) for w in works]

@api_router.get("/works/{work_id}", response_model=WorkResponse)
async def get_work(work_id: str):
    """Get a single work by ID."""
    work = await db.works.find_one({"work_id": work_id, "is_deleted": False}, {"_id": 0})
    if not work:
        raise HTTPException(status_code=404, detail="Opera non trovata")
    
    user = await db.users.find_one({"user_id": work["user_id"]}, {"_id": 0})
    if user:
        work["artisan_name"] = user.get("brand_name") or user.get("name")
        work["artisan_picture"] = user.get("profile_image") or user.get("picture")
        work["artisan_whatsapp"] = user.get("whatsapp")
    
    return WorkResponse(**work)

@api_router.put("/works/{work_id}", response_model=WorkResponse)
async def update_work(work_id: str, work_update: WorkUpdate, request: Request):
    """Update a work."""
    user = await get_current_user(request)
    
    work = await db.works.find_one({"work_id": work_id, "is_deleted": False}, {"_id": 0})
    if not work:
        raise HTTPException(status_code=404, detail="Opera non trovata")
    if work["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Non autorizzato")
    
    update_data = {k: v for k, v in work_update.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.works.update_one({"work_id": work_id}, {"$set": update_data})
    
    updated_work = await db.works.find_one({"work_id": work_id}, {"_id": 0})
    updated_work["artisan_name"] = user.get("brand_name") or user.get("name")
    updated_work["artisan_picture"] = user.get("profile_image") or user.get("picture")
    updated_work["artisan_whatsapp"] = user.get("whatsapp")
    
    return WorkResponse(**updated_work)

@api_router.delete("/works/{work_id}")
async def delete_work(work_id: str, request: Request):
    """Delete a work (soft delete)."""
    user = await get_current_user(request)
    
    work = await db.works.find_one({"work_id": work_id, "is_deleted": False}, {"_id": 0})
    if not work:
        raise HTTPException(status_code=404, detail="Opera non trovata")
    if work["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Non autorizzato")
    
    await db.works.update_one({"work_id": work_id}, {"$set": {"is_deleted": True}})
    return {"message": "Opera eliminata"}

# ==================== LIKES ENDPOINTS ====================

@api_router.post("/works/{work_id}/like", response_model=LikeResponse)
async def toggle_like(work_id: str, request: Request):
    """Toggle like on a work."""
    user = await get_current_user(request)
    
    existing = await db.likes.find_one(
        {"work_id": work_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    
    if existing:
        await db.likes.delete_one({"work_id": work_id, "user_id": user["user_id"]})
        liked = False
    else:
        await db.likes.insert_one({
            "like_id": f"like_{uuid.uuid4().hex[:12]}",
            "work_id": work_id,
            "user_id": user["user_id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        liked = True
    
    total = await db.likes.count_documents({"work_id": work_id})
    return LikeResponse(work_id=work_id, liked=liked, total_likes=total)

@api_router.get("/works/{work_id}/likes")
async def get_likes(work_id: str, request: Request):
    """Get like count and whether current user liked it."""
    total = await db.likes.count_documents({"work_id": work_id})
    liked = False
    try:
        user = await get_current_user(request)
        existing = await db.likes.find_one(
            {"work_id": work_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        liked = existing is not None
    except HTTPException:
        pass
    return {"work_id": work_id, "liked": liked, "total_likes": total}

@api_router.get("/likes/my")
async def get_my_likes(request: Request):
    """Get all work_ids the current user has liked."""
    user = await get_current_user(request)
    likes = await db.likes.find({"user_id": user["user_id"]}, {"_id": 0, "work_id": 1}).to_list(1000)
    return [l["work_id"] for l in likes]

# ==================== SEARCH ENDPOINTS ====================

@api_router.get("/search/artisans")
async def search_artisans(q: str = ""):
    """Search artisans by brand name or name."""
    if not q or len(q) < 2:
        return []
    
    query = {
        "$or": [
            {"brand_name": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}}
        ]
    }
    users = await db.users.find(query, {"_id": 0}).to_list(20)
    return users

# ==================== FILE UPLOAD ====================

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), request: Request = None):
    """Upload an image file."""
    user = await get_current_user(request)
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo di file non supportato")
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/uploads/{user['user_id']}/{uuid.uuid4()}.{ext}"
    
    data = await file.read()
    result = put_object(path, data, file.content_type)
    
    # Store file reference in DB
    await db.files.insert_one({
        "file_id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"path": result["path"]}

@api_router.get("/files/{path:path}")
async def download_file(path: str, auth: str = Query(None), request: Request = None):
    """Download a file from storage."""
    # Auth is optional for public images
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File non trovato")
    
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Cuore Artigiano API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
    except Exception as e:
        logger.error(f"Storage init failed on startup: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
