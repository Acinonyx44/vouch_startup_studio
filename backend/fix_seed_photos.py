"""Fix remaining seed experiences that still use Unsplash URLs."""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.config import settings
from app.services.google_places import search_places

SEED_PLACES = [
    ("Dogpound", "Dogpound gym NYC"),
    ("November Project NYC", "November Project fitness NYC"),
    ("Brooklyn Steel", "Brooklyn Steel concert venue Williamsburg"),
    ("Attaboy", "Attaboy bar Lower East Side NYC"),
    ("Smorgasburg", "Smorgasburg food market Brooklyn"),
    ("The Whitney", "Whitney Museum of American Art NYC"),
    ("The Met", "Metropolitan Museum of Art NYC"),
    ("Tatiana by Kwame Onwuachi", "Tatiana restaurant Lincoln Center NYC"),
    ("Webster Hall", "Webster Hall NYC music venue"),
    ("Don Angie", "Don Angie restaurant West Village NYC"),
    ("Le Bain at The Standard", "Le Bain rooftop bar Meatpacking NYC"),
    ("Los Tacos No. 1", "Los Tacos No 1 Chelsea Market NYC"),
]

NYC_LAT = 40.7128
NYC_LNG = -74.0060


async def main():
    engine = create_engine(settings.DATABASE_URL)
    updated = 0

    for db_name, query in SEED_PLACES:
        print(f"Searching: {query}")
        try:
            results = await search_places(
                query=query,
                latitude=NYC_LAT,
                longitude=NYC_LNG,
                radius=10000,
                max_results=1,
            )
        except Exception as e:
            print(f"  ERROR: {e}")
            continue

        if not results:
            print(f"  No results for {db_name}")
            continue

        place = results[0]
        photo_url = place.get("cover_photo_url", "")
        photo_urls = place.get("photo_urls", "")
        gid = place.get("google_place_id", "")

        if not photo_url:
            print(f"  No photo for {db_name}")
            continue

        with Session(engine) as session:
            session.execute(
                text("""
                    UPDATE experiences
                    SET cover_photo_url = :photo,
                        photo_urls = :photos,
                        google_place_id = COALESCE(google_place_id, :gid)
                    WHERE LOWER(name) = LOWER(:name)
                """),
                {"photo": photo_url, "photos": photo_urls, "gid": gid, "name": db_name},
            )
            session.commit()
        updated += 1
        print(f"  Updated: {db_name}")
        await asyncio.sleep(0.3)

    print(f"\nDone! Updated {updated} seed experiences with Google Places photos.")

if __name__ == "__main__":
    asyncio.run(main())
