"""
Map router — geo-pins for experiences and neighbourhood aggregations.
"""
from typing import Optional, List as TList
from uuid import UUID as PyUUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.auth import get_current_user_optional, get_current_user
from app.database import get_db
from app.models.experience import Experience
from app.models.follow import Follow
from app.models.rating import Rating
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.schemas import MapPinOut, NeighborhoodOut

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/pins", response_model=TList[MapPinOut])
def get_map_pins(
    category: Optional[str] = None,
    layer: Optional[str] = Query(None, description="mine | friends | wishlist | all"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """
    Return experiences that have lat/lng, with their average score.
    Filterable by category and layer (my ratings, friends', wishlist, or all).
    """
    # Base: experiences with coordinates
    base = (
        db.query(
            Experience,
            func.coalesce(func.avg(Rating.overall_score), 0).label("avg_score"),
            func.count(Rating.id).label("num_ratings"),
        )
        .outerjoin(Rating, Rating.experience_id == Experience.id)
        .filter(Experience.latitude.isnot(None), Experience.longitude.isnot(None))
        .group_by(Experience.id)
    )

    if category:
        base = base.filter(Experience.category == category)

    # Layer filtering (requires auth)
    if current_user and layer == "mine":
        my_exp_ids = (
            db.query(Rating.experience_id)
            .filter(Rating.user_id == current_user.id)
            .scalar_subquery()
        )
        base = base.filter(Experience.id.in_(my_exp_ids))

    elif current_user and layer == "friends":
        friend_ids = (
            db.query(Follow.following_id)
            .filter(Follow.follower_id == current_user.id)
            .scalar_subquery()
        )
        friend_exp_ids = (
            db.query(Rating.experience_id)
            .filter(Rating.user_id.in_(friend_ids))
            .scalar_subquery()
        )
        base = base.filter(Experience.id.in_(friend_exp_ids))

    elif current_user and layer == "wishlist":
        wish_exp_ids = (
            db.query(Wishlist.experience_id)
            .filter(Wishlist.user_id == current_user.id)
            .scalar_subquery()
        )
        base = base.filter(Experience.id.in_(wish_exp_ids))

    rows = base.order_by(desc("avg_score")).limit(200).all()

    pins = []
    for exp, avg_score, num_ratings in rows:
        pins.append(MapPinOut(
            id=exp.id,
            name=exp.name,
            category=exp.category,
            latitude=exp.latitude,
            longitude=exp.longitude,
            address=exp.address or "",
            neighborhood=exp.neighborhood or "",
            cover_photo_url=exp.cover_photo_url or "",
            avg_score=round(float(avg_score), 1),
            num_ratings=int(num_ratings),
        ))
    return pins


@router.get("/neighborhoods", response_model=TList[NeighborhoodOut])
def get_neighborhoods(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Aggregated stats per neighbourhood — how many experiences, avg score.
    """
    q = (
        db.query(
            Experience.neighborhood,
            func.count(Experience.id).label("count"),
            func.coalesce(func.avg(Rating.overall_score), 0).label("avg_score"),
        )
        .outerjoin(Rating, Rating.experience_id == Experience.id)
        .filter(Experience.neighborhood != "", Experience.neighborhood.isnot(None))
        .group_by(Experience.neighborhood)
    )
    if category:
        q = q.filter(Experience.category == category)

    rows = q.having(func.count(Experience.id) >= 1).order_by(desc("count")).limit(50).all()

    return [
        NeighborhoodOut(
            name=name,
            experience_count=count,
            avg_score=round(float(avg_score), 1),
        )
        for name, count, avg_score in rows
    ]
