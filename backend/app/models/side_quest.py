import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class SideQuest(Base):
    """Gamification challenge / weekly mission."""
    __tablename__ = "side_quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    category = Column(String(100), default="")
    points = Column(String(10), default="0")
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SideQuest {self.title}>"


class UserSideQuest(Base):
    """Tracks a user's progress on a side quest."""
    __tablename__ = "user_side_quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    side_quest_id = Column(
        UUID(as_uuid=True), ForeignKey("side_quests.id"), nullable=False, index=True
    )
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<UserSideQuest {self.user_id} → {self.side_quest_id}>"
