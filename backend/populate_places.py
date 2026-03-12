"""
Populate the Vouch database with real NYC experiences from Google Places API.

Usage:
    cd backend && python populate_places.py
"""
import asyncio
import sys
import os

# Ensure the app package is importable
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.config import settings
from app.services.google_places import search_places

# Queries grouped by Vouch category
QUERIES = {
    "Food & Drink": [
        "best restaurants NYC",
        "best cocktail bars NYC",
        "best ramen NYC",
        "best pizza NYC",
        "best brunch spots NYC",
        "best wine bars NYC",
        "best sushi NYC",
        "best tacos NYC",
        "best coffee shops NYC",
        "best speakeasy bars NYC",
    ],
    "Live Events": [
        "best live music venues NYC",
        "best comedy clubs NYC",
        "best jazz clubs NYC",
        "best concert halls NYC",
        "best theaters Broadway NYC",
    ],
    "Sports": [
        "sports stadiums NYC",
        "best basketball courts NYC",
        "best rock climbing gyms NYC",
        "best golf driving ranges NYC",
    ],
    "Wellness & Fitness": [
        "best gyms NYC",
        "best yoga studios NYC",
        "best spas NYC",
        "best pilates studios NYC",
        "best boxing gyms NYC",
    ],
    "Arts & Culture": [
        "best museums NYC",
        "best art galleries NYC",
        "best bookstores NYC",
    ],
    "Social Scenes": [
        "best rooftop bars NYC",
        "best nightclubs NYC",
        "best karaoke bars NYC",
        "best bowling alleys NYC",
    ],
}

NYC_LAT = 40.7128
NYC_LNG = -74.0060


async def fetch_all():
    """Fetch places from Google Places API for all queries."""
    all_places = []
    seen_ids = set()

    for category, queries in QUERIES.items():
        for query in queries:
            print(f"  Searching: {query}")
            try:
                results = await search_places(
                    query=query,
                    latitude=NYC_LAT,
                    longitude=NYC_LNG,
                    radius=15000,
                    max_results=5,
                )
            except Exception as e:
                print(f"    ERROR: {e}")
                continue

            for place in results:
                gid = place.get("google_place_id", "")
                if gid and gid not in seen_ids:
                    seen_ids.add(gid)
                    # Override category to match our grouping
                    place["category"] = category
                    all_places.append(place)
                    print(f"    + {place['name']} ({place['category']})")

            # Small delay to respect rate limits
            await asyncio.sleep(0.3)

    return all_places


def insert_places(places: list[dict]):
    """Insert places into the database, skipping duplicates."""
    engine = create_engine(settings.DATABASE_URL)
    inserted = 0
    updated_photos = 0
    skipped = 0

    with Session(engine) as session:
        for p in places:
            gid = p.get("google_place_id", "")
            name = p.get("name", "")
            if not name:
                continue

            # Check if already exists by google_place_id
            existing = None
            if gid:
                existing = session.execute(
                    text("SELECT id, cover_photo_url FROM experiences WHERE google_place_id = :gid"),
                    {"gid": gid},
                ).fetchone()

            # Also check by name (case-insensitive)
            if not existing:
                existing = session.execute(
                    text("SELECT id, cover_photo_url FROM experiences WHERE LOWER(name) = LOWER(:name)"),
                    {"name": name},
                ).fetchone()

            if existing:
                # Update photo if current one is empty or broken
                old_photo = existing[1] or ""
                new_photo = p.get("cover_photo_url", "")
                if new_photo and (not old_photo or "unsplash" in old_photo):
                    session.execute(
                        text("""
                            UPDATE experiences
                            SET cover_photo_url = :photo,
                                photo_urls = :photos,
                                google_place_id = COALESCE(google_place_id, :gid)
                            WHERE id = :id
                        """),
                        {
                            "photo": new_photo,
                            "photos": p.get("photo_urls", ""),
                            "gid": gid,
                            "id": str(existing[0]),
                        },
                    )
                    updated_photos += 1
                    print(f"  Updated photo: {name}")
                else:
                    skipped += 1
                continue

            # Insert new experience
            session.execute(
                text("""
                    INSERT INTO experiences
                        (id, name, category, subcategory, address, neighborhood,
                         latitude, longitude, google_place_id,
                         cover_photo_url, photo_urls, tags, description, is_event,
                         created_at, updated_at)
                    VALUES
                        (gen_random_uuid(), :name, :category, :subcategory, :address, :neighborhood,
                         :latitude, :longitude, :gid,
                         :cover_photo_url, :photo_urls, :tags, :description, false,
                         NOW(), NOW())
                """),
                {
                    "name": name,
                    "category": p.get("category", "Food & Drink"),
                    "subcategory": p.get("subcategory", ""),
                    "address": p.get("address", ""),
                    "neighborhood": "",
                    "latitude": p.get("latitude"),
                    "longitude": p.get("longitude"),
                    "gid": gid or None,
                    "cover_photo_url": p.get("cover_photo_url", ""),
                    "photo_urls": p.get("photo_urls", ""),
                    "tags": p.get("tags", ""),
                    "description": p.get("description", ""),
                },
            )
            inserted += 1

        session.commit()

    print(f"\nDone! Inserted: {inserted}, Updated photos: {updated_photos}, Skipped: {skipped}")


async def main():
    print("Fetching NYC experiences from Google Places API...\n")
    places = await fetch_all()
    print(f"\nFetched {len(places)} unique places. Inserting into database...\n")
    insert_places(places)


if __name__ == "__main__":
    asyncio.run(main())
