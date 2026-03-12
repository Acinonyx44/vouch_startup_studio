"""
Auth router — email signup/login + OAuth (Google) + Instagram stub.
All endpoints return a JWT access token + user object.
"""
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.schemas.schemas import (
    Token, EmailLogin, EmailRegister, GoogleAuth, InstagramAuth, UserOut,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------- Email ----------

@router.post("/register", response_model=Token, status_code=201)
def register_email(payload: EmailRegister, db: Session = Depends(get_db)):
    """Create a new user with email + password."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        display_name=payload.display_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login_email(payload: EmailLogin, db: Session = Depends(get_db)):
    """Authenticate with email + password."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user.id))
    return Token(access_token=token, user=UserOut.model_validate(user))


# ---------- OAuth — Google ----------

@router.post("/google", response_model=Token)
async def login_google(payload: GoogleAuth, db: Session = Depends(get_db)):
    """
    Exchange a Google ID token (credential) for a Vouch JWT.
    Verifies the token with Google, extracts profile info,
    finds or creates the user, and returns a Vouch access token.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=501,
            detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID in .env.",
        )

    # Verify the ID token with Google
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.credential},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google credential")

    info = resp.json()

    # Verify the token was issued for our app
    if info.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")

    google_id = info.get("sub")
    email = info.get("email")
    name = info.get("name", "")
    picture = info.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Find existing user by google_id or email
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if user:
        # Link google_id if not already set
        if not user.google_id:
            user.google_id = google_id
        if picture and not user.avatar_url:
            user.avatar_url = picture
        db.commit()
        db.refresh(user)
    else:
        # Create new user
        username = email.split("@")[0]
        # Ensure username uniqueness
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            email=email,
            username=username,
            display_name=name or username,
            avatar_url=picture,
            google_id=google_id,
            hashed_password="",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(str(user.id))
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/instagram", response_model=Token)
def login_instagram(payload: InstagramAuth, db: Session = Depends(get_db)):
    """
    Exchange an Instagram auth code for a Vouch JWT.
    TODO: Exchange code for IG token, fetch profile, find-or-create user.
    """
    raise HTTPException(
        status_code=501,
        detail="Instagram OAuth not yet configured. Set INSTAGRAM_CLIENT_ID in .env.",
    )


# ---------- Current user ----------

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user
