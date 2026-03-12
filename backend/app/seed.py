"""
Seed script — populates the Vouch database with demo data for development.

Run:  python -m app.seed
From: /Users/tush7301/Desktop/vouch/backend/
"""
import uuid
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.auth import hash_password
from app.models.user import User
from app.models.experience import Experience
from app.models.rating import Rating
from app.models.follow import Follow
from app.models.wishlist import Wishlist  # noqa: F401 — needed for relationship resolution
from app.models.list import List, ListItem  # noqa: F401
from app.models.side_quest import SideQuest, UserSideQuest  # noqa: F401


def seed():
    db = SessionLocal()

    # ── Check if already seeded ──
    if db.query(User).first():
        print("⚠️  Database already has data — skipping seed.")
        db.close()
        return

    print("🌱  Seeding Vouch database…")

    # ── Users ──
    users = [
        User(
            id=uuid.uuid4(),
            email="alex@vouch.app",
            username="alexchen",
            display_name="Alex Chen",
            bio="Food explorer & concert junkie. Always looking for the next hidden gem.",
            hashed_password=hash_password("password123"),
            onboarding_complete=True,
            selected_categories="Food & Drink,Live Events,Arts & Culture",
            streak_weeks="4",
            avatar_url="",
        ),
        User(
            id=uuid.uuid4(),
            email="maya@vouch.app",
            username="mayapatel",
            display_name="Maya Patel",
            bio="Wellness enthusiast & art lover. Your go-to for brunch spots.",
            hashed_password=hash_password("password123"),
            onboarding_complete=True,
            selected_categories="Wellness & Fitness,Food & Drink,Arts & Culture",
            streak_weeks="7",
            avatar_url="",
        ),
        User(
            id=uuid.uuid4(),
            email="jordan@vouch.app",
            username="jordanlee",
            display_name="Jordan Lee",
            bio="Sports fanatic & nightlife pro. If it's happening, I'm there.",
            hashed_password=hash_password("password123"),
            onboarding_complete=True,
            selected_categories="Sports,Social Scenes,Live Events",
            streak_weeks="2",
            avatar_url="",
        ),
        User(
            id=uuid.uuid4(),
            email="sam@vouch.app",
            username="samwilson",
            display_name="Sam Wilson",
            bio="Outdoor adventurer & coffee snob. Always chasing golden hour.",
            hashed_password=hash_password("password123"),
            onboarding_complete=True,
            selected_categories="Food & Drink,Wellness & Fitness,Sports",
            streak_weeks="11",
            avatar_url="",
        ),
        User(
            id=uuid.uuid4(),
            email="demo@vouch.app",
            username="demouser",
            display_name="Demo User",
            bio="Testing the Vouch app!",
            hashed_password=hash_password("demo1234"),
            onboarding_complete=True,
            selected_categories="Food & Drink,Live Events",
            streak_weeks="1",
            avatar_url="",
        ),
    ]

    db.add_all(users)
    db.flush()  # get IDs

    # ── Experiences ──
    experiences = [
        # Food & Drink
        Experience(
            id=uuid.uuid4(),
            name="Tatiana by Kwame Onwuachi",
            category="Food & Drink",
            subcategory="Restaurant",
            address="10 Lincoln Center Plaza, New York, NY 10023",
            neighborhood="Upper West Side",
            latitude=40.7725,
            longitude=-73.9835,
            description="Afro-Caribbean fine dining at Lincoln Center. Chef Kwame's tasting menu is an unforgettable experience.",
            tags="restaurant,fine-dining,date-night,tasting-menu",
            cover_photo_url="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
            google_place_id="seed_tatiana",
        ),
        Experience(
            id=uuid.uuid4(),
            name="Los Tacos No. 1",
            category="Food & Drink",
            subcategory="Taqueria",
            address="75 9th Ave, New York, NY 10011",
            neighborhood="Chelsea",
            latitude=40.7425,
            longitude=-74.0049,
            description="Legendary tacos inside Chelsea Market. The adobada and nopal are unbeatable.",
            tags="tacos,casual,quick-bite,iconic",
            cover_photo_url="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
            google_place_id="seed_lostacos",
        ),
        Experience(
            id=uuid.uuid4(),
            name="Don Angie",
            category="Food & Drink",
            subcategory="Restaurant",
            address="103 Greenwich Ave, New York, NY 10014",
            neighborhood="West Village",
            latitude=40.7371,
            longitude=-74.0003,
            description="Italian-American with a twist. The chrysanthemum lasagna is iconic.",
            tags="restaurant,italian,date-night,book-ahead",
            cover_photo_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
            google_place_id="seed_donangie",
        ),
        Experience(
            id=uuid.uuid4(),
            name="Attaboy",
            category="Food & Drink",
            subcategory="Bar",
            address="134 Eldridge St, New York, NY 10002",
            neighborhood="Lower East Side",
            latitude=40.7193,
            longitude=-73.9920,
            description="No menu speakeasy — tell the bartender what you like and trust the magic.",
            tags="bar,cocktails,speakeasy,craft",
            cover_photo_url="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
            google_place_id="seed_attaboy",
        ),

        # Live Events
        Experience(
            id=uuid.uuid4(),
            name="Brooklyn Steel",
            category="Live Events",
            subcategory="Concert Hall",
            address="319 Frost St, Brooklyn, NY 11222",
            neighborhood="Williamsburg",
            latitude=40.7170,
            longitude=-73.9395,
            description="1,800-cap venue with incredible sound and sightlines. The best mid-size room in NYC.",
            tags="concert_hall,live_music,venue",
            cover_photo_url="https://images.unsplash.com/photo-1501386761578-0a55d938946b?w=800&q=80",
            google_place_id="seed_brooklynsteel",
        ),
        Experience(
            id=uuid.uuid4(),
            name="Webster Hall",
            category="Live Events",
            subcategory="Concert Hall",
            address="125 E 11th St, New York, NY 10003",
            neighborhood="East Village",
            latitude=40.7320,
            longitude=-73.9893,
            description="Legendary NYC music venue since 1886. Recently renovated with top-tier production.",
            tags="concert_hall,live_music,iconic",
            cover_photo_url="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
            google_place_id="seed_websterhall",
        ),

        # Sports
        Experience(
            id=uuid.uuid4(),
            name="Madison Square Garden",
            category="Sports",
            subcategory="Arena",
            address="4 Pennsylvania Plaza, New York, NY 10001",
            neighborhood="Midtown",
            latitude=40.7505,
            longitude=-73.9934,
            description="The world's most famous arena. Home of the Knicks and Rangers.",
            tags="arena,basketball,hockey,iconic",
            cover_photo_url="https://images.unsplash.com/photo-1504450758481-7338bbe75c8e?w=800&q=80",
            google_place_id="seed_msg",
        ),
        Experience(
            id=uuid.uuid4(),
            name="Yankee Stadium",
            category="Sports",
            subcategory="Stadium",
            address="1 E 161st St, Bronx, NY 10451",
            neighborhood="South Bronx",
            latitude=40.8296,
            longitude=-73.9262,
            description="The House That Jeter Re-Built. Nothing beats a summer night in the Bronx.",
            tags="stadium,baseball,sports,iconic",
            cover_photo_url="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80",
            google_place_id="seed_yankees",
        ),

        # Wellness & Fitness
        Experience(
            id=uuid.uuid4(),
            name="November Project NYC",
            category="Wellness & Fitness",
            subcategory="Outdoor Fitness",
            address="Central Park, New York, NY 10024",
            neighborhood="Upper West Side",
            latitude=40.7812,
            longitude=-73.9665,
            description="Free dawn workout community. Stadium stairs and sprints every Wednesday.",
            tags="fitness,outdoor,free,community",
            cover_photo_url="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
            google_place_id="seed_novproject",
        ),
        Experience(
            id=uuid.uuid4(),
            name="Dogpound",
            category="Wellness & Fitness",
            subcategory="Gym",
            address="155 W 23rd St, New York, NY 10011",
            neighborhood="Chelsea",
            latitude=40.7437,
            longitude=-73.9952,
            description="Celebrity-favorite boutique gym with intense, results-driven personal training.",
            tags="gym,personal-training,fitness,premium",
            cover_photo_url="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
            google_place_id="seed_dogpound",
        ),

        # Arts & Culture
        Experience(
            id=uuid.uuid4(),
            name="The Met",
            category="Arts & Culture",
            subcategory="Museum",
            address="1000 5th Ave, New York, NY 10028",
            neighborhood="Upper East Side",
            latitude=40.7794,
            longitude=-73.9632,
            description="World's greatest art museum. 5,000 years of art across 2 million sq ft.",
            tags="museum,art,culture,world-class",
            cover_photo_url="https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=80",
            google_place_id="seed_met",
        ),
        Experience(
            id=uuid.uuid4(),
            name="The Whitney",
            category="Arts & Culture",
            subcategory="Museum",
            address="99 Gansevoort St, New York, NY 10014",
            neighborhood="Meatpacking District",
            latitude=40.7396,
            longitude=-74.0089,
            description="American art museum with stunning rooftop views of the High Line and Hudson.",
            tags="museum,contemporary,rooftop,american-art",
            cover_photo_url="https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
            google_place_id="seed_whitney",
        ),

        # Social Scenes
        Experience(
            id=uuid.uuid4(),
            name="Smorgasburg",
            category="Social Scenes",
            subcategory="Food Market",
            address="90 Kent Ave, Brooklyn, NY 11249",
            neighborhood="Williamsburg",
            latitude=40.7216,
            longitude=-73.9614,
            description="NYC's iconic outdoor food market. 100+ vendors every weekend on the waterfront.",
            tags="outdoor,food,social,weekend",
            cover_photo_url="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
            google_place_id="seed_smorgasburg",
        ),
        Experience(
            id=uuid.uuid4(),
            name="Le Bain at The Standard",
            category="Social Scenes",
            subcategory="Rooftop Bar",
            address="848 Washington St, New York, NY 10014",
            neighborhood="Meatpacking District",
            latitude=40.7407,
            longitude=-74.0076,
            description="Rooftop bar and club at The Standard. Plunge pool, disco ball, Hudson River sunsets.",
            tags="rooftop,nightlife,social,views",
            cover_photo_url="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80",
            google_place_id="seed_lebain",
        ),
    ]

    db.add_all(experiences)
    db.flush()

    # ── Ratings ──
    # Each user rates a handful of experiences
    now = datetime.utcnow()
    ratings_data = [
        # Alex rates
        (users[0], experiences[0], 9, 7, 9, "Kwame's tasting menu is transcendent. Every course tells a story.", "date-night,worth-the-hype"),
        (users[0], experiences[4], 10, 8, 10, "Seen three shows here — best sound of any mid-size venue in NYC.", "great-for-groups"),
        (users[0], experiences[10], 9, 8, 9, "The Met never disappoints. The Temple of Dendur room is magical.", "hidden-gem"),
        (users[0], experiences[2], 10, 6, 9, "Don Angie's chrysanthemum lasagna lives up to the hype. Book weeks ahead.", "worth-the-hype,book-ahead"),

        # Maya rates
        (users[1], experiences[0], 8, 7, 8, "Stunning setting at Lincoln Center. The cocktail pairing is a must.", "date-night"),
        (users[1], experiences[1], 9, 8, 10, "Los Tacos is my happy place. The adobada taco is *chef's kiss*.", "hidden-gem,quick-bite"),
        (users[1], experiences[8], 10, 10, 10, "November Project changed my life. Free and incredibly motivating.", "hidden-gem"),
        (users[1], experiences[11], 8, 7, 9, "The Whitney rooftop views alone are worth the visit.", "great-for-dates"),

        # Jordan rates
        (users[2], experiences[6], 10, 7, 10, "Nothing beats a Knicks game at MSG. Electric atmosphere.", "iconic,worth-the-hype"),
        (users[2], experiences[7], 9, 7, 9, "Summer nights in the Bronx are unbeatable. Get the bleacher seats.", "great-for-groups"),
        (users[2], experiences[3], 9, 8, 10, "Just tell them 'something smoky' and trust the process.", "hidden-gem,book-ahead"),
        (users[2], experiences[12], 8, 9, 8, "Smorgasburg on a sunny Saturday — perfect NYC vibes.", "great-for-groups"),

        # Sam rates
        (users[3], experiences[1], 10, 9, 10, "Best quick tacos in NYC, fight me. The nopal is incredible.", "worth-the-hype"),
        (users[3], experiences[9], 8, 7, 9, "Dogpound is intense but you see results. Worth the premium.", "hidden-gem"),
        (users[3], experiences[2], 9, 5, 8, "Don Angie is absolutely incredible. Pricey but worth every penny.", "book-ahead,worth-the-hype"),
        (users[3], experiences[13], 8, 8, 8, "Le Bain sunset sessions are perfect when you want to feel fancy.", "great-for-groups"),
    ]

    for user_obj, exp_obj, vibe, value, exp_score, review, tags in ratings_data:
        overall = round((vibe + value + exp_score) / 3, 1)
        rating = Rating(
            id=uuid.uuid4(),
            user_id=user_obj.id,
            experience_id=exp_obj.id,
            vibe_score=vibe,
            value_score=value,
            experience_score=exp_score,
            overall_score=overall,
            review_text=review,
            tags=tags,
            created_at=now - timedelta(days=len(ratings_data)),
        )
        db.add(rating)
        now = now - timedelta(hours=8)  # stagger timestamps

    # ── Follows (friend graph) ──
    follow_pairs = [
        (users[0], users[1]),  # Alex → Maya
        (users[0], users[2]),  # Alex → Jordan
        (users[1], users[0]),  # Maya → Alex
        (users[1], users[3]),  # Maya → Sam
        (users[2], users[0]),  # Jordan → Alex
        (users[2], users[3]),  # Jordan → Sam
        (users[3], users[0]),  # Sam → Alex
        (users[3], users[1]),  # Sam → Maya
        # Demo user follows everyone
        (users[4], users[0]),
        (users[4], users[1]),
        (users[4], users[2]),
        (users[4], users[3]),
    ]

    for follower, following in follow_pairs:
        db.add(Follow(
            id=uuid.uuid4(),
            follower_id=follower.id,
            following_id=following.id,
        ))

    db.commit()
    db.close()

    print(f"✅  Seeded {len(users)} users, {len(experiences)} experiences, "
          f"{len(ratings_data)} ratings, {len(follow_pairs)} follows.")
    print(f"    Demo login: demo@vouch.app / demo1234")
    print(f"    Also try:   alex@vouch.app / password123")


if __name__ == "__main__":
    seed()
