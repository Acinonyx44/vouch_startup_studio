"""
Follow/Friends router — follow/unfollow, list followers/following, search users.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.schemas.schemas import FollowOut, FollowUserOut
from app.models.user import User
from app.models.follow import Follow

router = APIRouter(prefix="/users", tags=["friends"])


@router.post("/{user_id}/follow", response_model=FollowOut, status_code=201)
def follow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Follow another user."""
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.following_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already following this user")

    follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    db.commit()
    db.refresh(follow)
    return follow


@router.delete("/{user_id}/follow", status_code=204)
def unfollow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unfollow a user."""
    follow = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.following_id == user_id)
        .first()
    )
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")

    db.delete(follow)
    db.commit()


@router.get("/{user_id}/followers", response_model=List[FollowUserOut])
def get_followers(user_id: str, db: Session = Depends(get_db)):
    """List users who follow user_id."""
    follows = db.query(Follow).filter(Follow.following_id == user_id).all()
    follower_ids = [f.follower_id for f in follows]
    if not follower_ids:
        return []
    return db.query(User).filter(User.id.in_(follower_ids), User.is_active == True).all()


@router.get("/{user_id}/following", response_model=List[FollowUserOut])
def get_following(user_id: str, db: Session = Depends(get_db)):
    """List users that user_id follows."""
    follows = db.query(Follow).filter(Follow.follower_id == user_id).all()
    following_ids = [f.following_id for f in follows]
    if not following_ids:
        return []
    return db.query(User).filter(User.id.in_(following_ids), User.is_active == True).all()


@router.get("/search", response_model=List[FollowUserOut])
def search_users(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    """Search users by username or display name."""
    pattern = f"%{q}%"
    return (
        db.query(User)
        .filter(
            User.is_active == True,
            (User.username.ilike(pattern) | User.display_name.ilike(pattern)),
        )
        .limit(20)
        .all()
    )
