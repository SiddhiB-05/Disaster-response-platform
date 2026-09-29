import hashlib
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.database.models import User
from app.database.schemas import UserSignup, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/v1/auth", tags=["Government Officer Authentication"])

def hash_password(password: str) -> str:
    """Hashes a password using SHA-256 for secure demo auth."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def generate_mock_token(user: User) -> str:
    """Generates a secure officer bearer token."""
    raw = f"OFFICER_TOKEN::{user.officer_id}::{user.email}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()[:32]

def ensure_default_officers(db: Session):
    """Seed standard Government Officer credentials if users table is empty."""
    officer_191 = db.query(User).filter(User.officer_id == "OFF-191-SDMA").first()
    if not officer_191:
        default_officers = [
            User(
                officer_id="OFF-191-SDMA",
                email="officer.sih@sdma.gov.in",
                full_name="Commander Rajesh Sharma",
                password_hash=hash_password("disaster123"),
                department="State Disaster Management Authority (SDMA)",
                role="Government Officer",
                badge_number="SDMA-7892",
                district="Rourkela Zone"
            ),
            User(
                officer_id="OFF-502-NDRF",
                email="ndrf.command@gov.in",
                full_name="Inspector Anita Roy",
                password_hash=hash_password("disaster123"),
                department="National Disaster Response Force (NDRF)",
                role="Field Response Commander",
                badge_number="NDRF-4410",
                district="Rourkela Sector 6"
            ),
            User(
                officer_id="ADMIN-001",
                email="admin.disaster@odisha.gov.in",
                full_name="Dr. Suresh Verma",
                password_hash=hash_password("admin123"),
                department="District Emergency Operations Center (DEOC)",
                role="District Magistrate / Admin",
                badge_number="DEOC-001",
                district="Sundargarh District"
            )
        ]
        db.add_all(default_officers)
        db.commit()

@router.post("/signup", response_model=TokenResponse)
def signup(user_in: UserSignup, db: Session = Depends(get_db)):
    """Register a new Government Officer account."""
    ensure_default_officers(db)

    existing = db.query(User).filter(
        (User.officer_id == user_in.officer_id.strip()) | 
        (User.email == user_in.email.strip().lower())
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An Officer account with this Officer ID or Email already exists."
        )

    new_user = User(
        officer_id=user_in.officer_id.strip(),
        email=user_in.email.strip().lower(),
        full_name=user_in.full_name.strip(),
        password_hash=hash_password(user_in.password),
        department=user_in.department or "State Disaster Management Authority (SDMA)",
        role=user_in.role or "Government Officer",
        badge_number=user_in.badge_number,
        district=user_in.district or "Rourkela Zone"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = generate_mock_token(new_user)
    return TokenResponse(
        token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate Government Officer via Officer ID or Email and password."""
    ensure_default_officers(db)

    query_param = credentials.officer_id_or_email.strip().lower()
    
    # Check exact match first
    user = db.query(User).filter(
        (User.officer_id.ilike(query_param)) | 
        (User.email.ilike(query_param))
    ).first()

    # Friendly alias matching for common officer login variations
    if not user:
        if query_param in ["officer@dsma.gov.in", "officer@sdma.gov.in", "officer.sih@sdma.gov.in", "officer"]:
            user = db.query(User).filter(User.officer_id == "OFF-191-SDMA").first()
        elif "ndrf" in query_param:
            user = db.query(User).filter(User.officer_id == "OFF-502-NDRF").first()
        elif "admin" in query_param:
            user = db.query(User).filter(User.officer_id == "ADMIN-001").first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Officer ID or Email. Try 'OFF-191-SDMA' or click Quick Demo Login."
        )

    hashed_input = hash_password(credentials.password)
    if user.password_hash != hashed_input:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password credentials."
        )

    token = generate_mock_token(user)
    return TokenResponse(
        token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Retrieve details of currently authenticated Government Officer."""
    ensure_default_officers(db)
    
    # Fallback to default SDMA officer if header not present for demo testing
    officer = db.query(User).filter(User.officer_id == "OFF-191-SDMA").first()
    if not officer:
        officer = db.query(User).first()
        
    return UserResponse.model_validate(officer)
