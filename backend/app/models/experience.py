import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Experience(Base):
    """A venue, event, or activity that can be rated."""
    __tablename__ = "experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(300), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), default="")

    # Location
    address = Column(String(500), default="")
    neighborhood = Column(String(100), default="", index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # External source
    google_place_id = Column(String(255), unique=True, nullable=True)
    ticketmaster_id = Column(String(255), unique=True, nullable=True)

    # Media
    cover_photo_url = Column(Text, default="")
    photo_urls = Column(Text, default="")  # JSON array stored as text

    # Metadata
    tags = Column(Text, default="")  # comma-separated
    description = Column(Text, default="")
    is_event = Column(Boolean, default=False)
    event_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ratings = relationship("Rating", back_populates="experience", lazy="dynamic")

    def __repr__(self):
        return f"<Experience {self.name}>"
