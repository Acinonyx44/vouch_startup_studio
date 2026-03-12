"""
Import all models so SQLAlchemy relationship references resolve correctly.
This module must be imported before any ORM queries run.
"""
from app.models.user import User  # noqa: F401
from app.models.experience import Experience  # noqa: F401
from app.models.rating import Rating  # noqa: F401
from app.models.follow import Follow  # noqa: F401
from app.models.wishlist import Wishlist  # noqa: F401
from app.models.list import List, ListItem  # noqa: F401
from app.models.side_quest import SideQuest, UserSideQuest  # noqa: F401