from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import uuid
import asyncio
import bcrypt
import jwt
import resend
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

# ==========================================
# Configuration
# ==========================================
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
RESEND_API_KEY = os.environ['RESEND_API_KEY']
SENDER_EMAIL = os.environ['SENDER_EMAIL']
RECIPIENT_EMAIL = os.environ['RECIPIENT_EMAIL']

resend.api_key = RESEND_API_KEY

app = FastAPI(title="Velstrax API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ==========================================
# Auth helpers
# ==========================================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==========================================
# Models
# ==========================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SettingsModel(BaseModel):
    youtube: str = ""
    instagram: str = ""
    tiktok: str = ""
    email: str = ""


class PortfolioCreate(BaseModel):
    title: str
    category: str
    description: str
    image_url: str
    metric_before: str = ""
    metric_after: str = ""
    tags: List[str] = []
    order: int = 0
    title_en: str = ""
    description_en: str = ""
    category_en: str = ""


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    metric_before: Optional[str] = None
    metric_after: Optional[str] = None
    tags: Optional[List[str]] = None
    order: Optional[int] = None
    title_en: Optional[str] = None
    description_en: Optional[str] = None
    category_en: Optional[str] = None


class PortfolioItem(BaseModel):
    id: str
    title: str
    category: str
    description: str
    image_url: str
    metric_before: str = ""
    metric_after: str = ""
    tags: List[str] = []
    order: int = 0
    title_en: str = ""
    description_en: str = ""
    category_en: str = ""


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


# ==========================================
# Auth Routes
# ==========================================
@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=8 * 3600,
        path="/",
    )
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ==========================================
# Settings (Social Links)
# ==========================================
@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"key": "global"}, {"_id": 0, "key": 0})
    if not doc:
        return {"youtube": "", "instagram": "", "tiktok": "", "email": ""}
    return doc


@api_router.put("/settings")
async def update_settings(payload: SettingsModel, user: dict = Depends(get_current_user)):
    await db.settings.update_one(
        {"key": "global"},
        {"$set": {**payload.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return payload.model_dump()


# ==========================================
# Portfolio
# ==========================================
@api_router.get("/portfolio", response_model=List[PortfolioItem])
async def list_portfolio():
    items = await db.portfolio.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    return items


@api_router.post("/portfolio", response_model=PortfolioItem)
async def create_portfolio(payload: PortfolioCreate, user: dict = Depends(get_current_user)):
    item = {"id": str(uuid.uuid4()), **payload.model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat()}
    await db.portfolio.insert_one(item.copy())
    item.pop("created_at", None)
    return item


@api_router.put("/portfolio/{item_id}", response_model=PortfolioItem)
async def update_portfolio(item_id: str, payload: PortfolioUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.portfolio.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    updated = await db.portfolio.find_one({"id": item_id}, {"_id": 0})
    return updated


@api_router.delete("/portfolio/{item_id}")
async def delete_portfolio(item_id: str, user: dict = Depends(get_current_user)):
    result = await db.portfolio.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return {"message": "Deleted"}


# ==========================================
# Contact
# ==========================================
def _build_contact_email(c: ContactRequest) -> str:
    return f"""
<table style="width:100%;max-width:600px;margin:0 auto;font-family:Helvetica,Arial,sans-serif;background:#0A0A0A;color:#FFFFFF;padding:32px;border:1px solid rgba(255,255,255,0.1);">
  <tr><td>
    <h1 style="font-size:28px;font-weight:300;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 8px;color:#FFFFFF;">VELTRAX</h1>
    <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#A1A1AA;margin:0 0 32px;">New Project Inquiry</p>
    <table style="width:100%;border-collapse:collapse;color:#FFFFFF;">
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);"><strong>Name</strong></td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);text-align:right;color:#A1A1AA;">{c.name}</td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);"><strong>Email</strong></td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);text-align:right;color:#A1A1AA;">{c.email}</td></tr>
    </table>
    <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#A1A1AA;margin:32px 0 8px;">Message</p>
    <p style="font-size:15px;line-height:1.7;color:#FFFFFF;margin:0;white-space:pre-wrap;">{c.message}</p>
    <p style="font-size:11px;color:#52525B;margin:48px 0 0;letter-spacing:0.1em;">Sent from veltrax.com contact form</p>
  </td></tr>
</table>
"""


@api_router.post("/contact")
async def submit_contact(payload: ContactRequest):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contacts.insert_one(doc.copy())

    # Send email via Resend (non-blocking)
    email_sent = False
    try:
        params = {
            "from": f"Veltrax <{SENDER_EMAIL}>",
            "to": [RECIPIENT_EMAIL],
            "subject": f"New Inquiry — {payload.name}",
            "html": _build_contact_email(payload),
            "reply_to": payload.email,
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        email_sent = bool(result.get("id"))
        logger.info(f"Resend email response: {result}")
    except Exception as e:
        logger.error(f"Resend email failed: {e}")

    return {"message": "Contact submitted", "email_sent": email_sent}


@api_router.get("/contacts")
async def list_contacts(user: dict = Depends(get_current_user)):
    items = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.get("/")
async def root():
    return {"message": "Veltrax API"}


# ==========================================
# Startup seeding
# ==========================================
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}}
        )
        logger.info("Admin password updated")


async def seed_portfolio():
    count = await db.portfolio.count_documents({})
    if count > 0:
        return
    items = [
        {
            "id": str(uuid.uuid4()),
            "title": "Olivia Studio",
            "title_en": "Olivia Studio",
            "category": "Στούντιο Ομορφιάς",
            "category_en": "Beauty Studio",
            "description": "Επανασχεδιασμός ταυτότητας και πλήρους κρατήσεων online για ένα boutique στούντιο στην Αθήνα.",
            "description_en": "Brand rebuild and full online booking system for an Athens boutique studio.",
            "image_url": "https://images.unsplash.com/photo-1527576539890-dfa815648363?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
            "metric_before": "12 κρατήσεις/εβδ.",
            "metric_after": "84 κρατήσεις/εβδ.",
            "tags": ["Booking", "Brand", "UX"],
            "order": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Nera Restaurant",
            "title_en": "Nera Restaurant",
            "category": "Εστιατόριο",
            "category_en": "Restaurant",
            "description": "Σύστημα παραγγελιών και κρατήσεων τραπεζιών για ένα fine-dining στη Σαντορίνη.",
            "description_en": "Ordering and table reservation system for a Santorini fine-dining venue.",
            "image_url": "https://images.unsplash.com/photo-1559329007-40df8a9345d8?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
            "metric_before": "€18k / μήνα",
            "metric_after": "€61k / μήνα",
            "tags": ["Ordering", "Reservations", "SEO"],
            "order": 2,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Atelier Mavros",
            "title_en": "Atelier Mavros",
            "category": "Αρχιτεκτονικό Γραφείο",
            "category_en": "Architecture Firm",
            "description": "Premium portfolio site και CRM integration για βραβευμένο γραφείο αρχιτεκτόνων.",
            "description_en": "Premium portfolio site and CRM integration for an award-winning architecture firm.",
            "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
            "metric_before": "2 leads/μήνα",
            "metric_after": "29 leads/μήνα",
            "tags": ["Portfolio", "CRM", "Luxury"],
            "order": 3,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Lykavittos Coffee",
            "title_en": "Lykavittos Coffee",
            "category": "Specialty Coffee",
            "category_en": "Specialty Coffee",
            "description": "E-commerce καταστήματος καφέ με ολοκληρωμένο σύστημα συνδρομών και ζωντανών συμβάντων.",
            "description_en": "Specialty coffee e-commerce with subscriptions and live event ordering.",
            "image_url": "https://images.unsplash.com/photo-1453614512568-c4024d13c247?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
            "metric_before": "0 online sales",
            "metric_after": "€24k / μήνα",
            "tags": ["E-commerce", "Subscriptions"],
            "order": 4,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Kallia Wellness",
            "title_en": "Kallia Wellness",
            "category": "Wellness & Spa",
            "category_en": "Wellness & Spa",
            "description": "Πλατφόρμα κρατήσεων με ραντεβού, ηλεκτρονικές δωροκάρτες και AI υποστήριξη πελατών.",
            "description_en": "Booking platform with appointments, e-gift cards and AI customer support.",
            "image_url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
            "metric_before": "Τηλεφωνικές κρατήσεις",
            "metric_after": "78% αυτοεξυπηρέτηση",
            "tags": ["Booking", "AI", "Gift Cards"],
            "order": 5,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Sphera Yachts",
            "title_en": "Sphera Yachts",
            "category": "Πολυτελή Σκάφη",
            "category_en": "Luxury Yachts",
            "description": "Editorial εμπειρία με 3D scroll και custom request flow για luxury charter επιχείρηση.",
            "description_en": "Editorial 3D-scroll experience and custom request flow for a luxury charter business.",
            "image_url": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
            "metric_before": "€140k / σεζόν",
            "metric_after": "€480k / σεζόν",
            "tags": ["3D", "Editorial", "Bespoke"],
            "order": 6,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.portfolio.insert_many([i.copy() for i in items])
    logger.info(f"Seeded {len(items)} portfolio items")


async def seed_settings():
    existing = await db.settings.find_one({"key": "global"})
    if not existing:
        await db.settings.insert_one({
            "key": "global",
            "youtube": "",
            "instagram": "",
            "tiktok": "",
            "email": "veltrax.services@gmail.com",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })


@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.portfolio.create_index("id", unique=True)
    await db.settings.create_index("key", unique=True)
    await seed_admin()
    await seed_settings()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
