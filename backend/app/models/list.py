import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class List(Base):
    """User-curated list of experiences (e.g. 'Best Date Night Spots')."""
    __tablename__ = "lists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    cover_photo_url = Column(String(500), default="")
    is_public = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="lists")
    items = relationship("ListItem", back_populates="list", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<List {self.name}>"


class ListItem(Base):
    """An experience inside a user list."""
    __tablename__ = "list_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    list_id = Column(UUID(as_uuid=True), ForeignKey("lists.id"), nullable=False, index=True)
    experience_id = Column(
        UUID(as_uuid=True), ForeignKey("experiences.id"), nullable=False
    )
    note = Column(Text, default="")
    position = Column(String(10), default="0")  # ordering

    created_at = Column(DateTime, default=datetime.utcnow)

    list = relationship("List", back_populates="items")

    def __repr__(self):
        return f"<ListItem {self.experience_id} in {self.list_id}>"
