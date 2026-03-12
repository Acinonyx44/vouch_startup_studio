import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Wishlist(Base):
    """A saved experience the user wants to try."""
    __tablename__ = "wishlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    experience_id = Column(
        UUID(as_uuid=True), ForeignKey("experiences.id"), nullable=False, index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "experience_id", name="uq_wishlist"),
    )

    user = relationship("User", back_populates="wishlists")

    def __repr__(self):
        return f"<Wishlist {self.user_id} → {self.experience_id}>"
