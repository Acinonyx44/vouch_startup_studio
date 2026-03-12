import uuid
from datetime import datetime

from sqlalchemy import Column, Float, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Rating(Base):
    """A user's rating of an experience (3-axis: vibe, value, experience → overall vouch score)."""
    __tablename__ = "ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    experience_id = Column(
        UUID(as_uuid=True), ForeignKey("experiences.id"), nullable=False, index=True
    )

    # 3-axis scores (0-10 scale)
    vibe_score = Column(Float, nullable=False)
    value_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)

    # Computed overall (average of 3 axes, stored for fast queries)
    overall_score = Column(Float, nullable=False)

    # Review content
    review_text = Column(Text, default="")
    photo_urls = Column(Text, default="")  # JSON array as text
    tags = Column(Text, default="")  # comma-separated

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="ratings")
    experience = relationship("Experience", back_populates="ratings")

    def __repr__(self):
        return f"<Rating {self.overall_score} by {self.user_id} on {self.experience_id}>"
