"""
Ticketmaster Discovery API integration.

Uses the Ticketmaster API for:
  - Event search (by keyword, city, date range)

Returns normalised dicts that map to Experience model fields (is_event=True).
Requires TICKETMASTER_API_KEY in .env.
Falls back to demo data when no API key is configured.
"""
import httpx
from typing import Optional
from datetime import datetime

from app.config import settings

BASE_URL = "https://app.ticketmaster.com/discovery/v2"

# Map Ticketmaster classification segment → Vouch category
SEGMENT_CATEGORY_MAP = {
    "Music": "Live Events",
    "Sports": "Sports",
    "Arts & Theatre": "Arts & Culture",
    "Film": "Arts & Culture",
    "Miscellaneous": "Social Scenes",
    "Undefined": "Live Events",
}


def _normalise_event(event: dict) -> dict:
    """Convert a Ticketmaster event into an Experience-compatible dict."""
    name = event.get("name", "")

    # Classification
    classifications = event.get("classifications", [{}])
    segment = classifications[0].get("segment", {}).get("name", "") if classifications else ""
    genre = classifications[0].get("genre", {}).get("name", "") if classifications else ""
    category = SEGMENT_CATEGORY_MAP.get(segment, "Live Events")

    # Venue
    venues = event.get("_embedded", {}).get("venues", [{}])
    venue = venues[0] if venues else {}
    address_parts = []
    if venue.get("address", {}).get("line1"):
        address_parts.append(venue["address"]["line1"])
    if venue.get("city", {}).get("name"):
        address_parts.append(venue["city"]["name"])
    if venue.get("state", {}).get("stateCode"):
        address_parts.append(venue["state"]["stateCode"])

    location = venue.get("location", {})

    # Images
    images = event.get("images", [])
    cover = images[0]["url"] if images else ""
    photo_urls = ",".join(img["url"] for img in images[:5])

    # Date
    dates = event.get("dates", {}).get("start", {})
    event_date_str = dates.get("dateTime") or dates.get("localDate")
    event_date = None
    if event_date_str:
        try:
            event_date = datetime.fromisoformat(event_date_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            pass

    return {
        "ticketmaster_id": event.get("id", ""),
        "name": name,
        "category": category,
        "subcategory": genre or segment,
        "address": ", ".join(address_parts),
        "neighborhood": venue.get("city", {}).get("name", ""),
        "latitude": float(location.get("latitude", 0)) if location.get("latitude") else None,
        "longitude": float(location.get("longitude", 0)) if location.get("longitude") else None,
        "description": event.get("info", "") or event.get("pleaseNote", ""),
        "tags": ",".join(filter(None, [segment, genre])),
        "cover_photo_url": cover,
        "photo_urls": photo_urls,
        "is_event": True,
        "event_date": event_date,
    }


async def search_events(
    keyword: str,
    city: Optional[str] = None,
    max_results: int = 10,
) -> list[dict]:
    """
    Search Ticketmaster for events matching a keyword.
    Returns normalised event dicts.
    """
    if not settings.TICKETMASTER_API_KEY:
        return _demo_events(keyword)

    params: dict = {
        "apikey": settings.TICKETMASTER_API_KEY,
        "keyword": keyword,
        "size": max_results,
        "sort": "date,asc",
    }

    if city:
        params["city"] = city

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/events.json",
            params=params,
            timeout=10,
        )
        resp.raise_for_status()

    data = resp.json()
    events = data.get("_embedded", {}).get("events", [])
    return [_normalise_event(e) for e in events]


# ---------- Demo fallback (no API key) ----------

def _demo_events(keyword: str) -> list[dict]:
    """Return sample events when no API key is configured."""
    demos = [
        {
            "ticketmaster_id": "evt_demo_1",
            "name": "Indie Rock Night",
            "category": "Live Events",
            "subcategory": "Rock",
            "address": "319 Frost St, Brooklyn, NY 11222",
            "neighborhood": "Williamsburg",
            "latitude": 40.7170,
            "longitude": -73.9395,
            "description": "An evening of the best local indie rock bands at Brooklyn Steel.",
            "tags": "Music,Rock",
            "cover_photo_url": "",
            "photo_urls": "",
            "is_event": True,
            "event_date": None,
        },
        {
            "ticketmaster_id": "evt_demo_2",
            "name": "Yankees vs. Red Sox",
            "category": "Sports",
            "subcategory": "Baseball",
            "address": "1 E 161st St, Bronx, NY 10451",
            "neighborhood": "South Bronx",
            "latitude": 40.8296,
            "longitude": -73.9262,
            "description": "The classic rivalry game at Yankee Stadium.",
            "tags": "Sports,Baseball",
            "cover_photo_url": "",
            "photo_urls": "",
            "is_event": True,
            "event_date": None,
        },
        {
            "ticketmaster_id": "evt_demo_3",
            "name": "Stand-Up Comedy Showcase",
            "category": "Live Events",
            "subcategory": "Comedy",
            "address": "117 MacDougal St, New York, NY 10012",
            "neighborhood": "Greenwich Village",
            "latitude": 40.7304,
            "longitude": -74.0003,
            "description": "Top comedians perform live at the Comedy Cellar.",
            "tags": "Arts & Theatre,Comedy",
            "cover_photo_url": "",
            "photo_urls": "",
            "is_event": True,
            "event_date": None,
        },
    ]

    q = keyword.lower()
    matches = [d for d in demos if q in d["name"].lower() or q in d["category"].lower() or q in d["tags"].lower()]
    return matches if matches else demos
