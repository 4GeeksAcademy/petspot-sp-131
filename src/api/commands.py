
import os
import click, random, requests
from api.cities import cities
from api.routes import resolve_place_address_geocode
from datetime import datetime, timedelta
from api.models import db, User, Place, EstablishmentType, City, Favorite, AdminUser, Review, Reservation, ReservationStatus, Chat, News, PostType, Race, Pet, PetAnimalType, PetSize, PlaceSchedule, Table
from werkzeug.security import generate_password_hash
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from decimal import Decimal

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""
def setup_commands(app):
    
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        added_count = 0
        next_index = 1

        while added_count < int(count):
            email = "test_user" + str(next_index) + "@test.com"
            existing_user = db.session.execute(
                select(User).where(User.email == email)
            ).scalar_one_or_none()

            if existing_user:
                print("User: ", email, " already exists. Skipping.")
                next_index += 1
                continue

            user = User()
            user.email = email
            user.password = generate_password_hash("123456")
            user.is_active = True
            user.name = "Name_User_" + str(next_index)
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")
            added_count += 1
            next_index += 1

        print("All test users created")

    @app.cli.command("insert-test-users-with-location") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users_with_location(count):
        print("Creating test users")
        added_count = 0
        next_index = 1

        while added_count < int(count):
            email = "test_user" + str(next_index) + "@test.com"
            existing_user = db.session.execute(
                select(User).where(User.email == email)
            ).scalar_one_or_none()

            if existing_user:
                print("User: ", email, " already exists. Skipping.")
                next_index += 1
                continue

            cities_exist = db.session.execute(select(City)).scalars().all() or None
            if cities_exist is None:
                return print("Unable to add users. Cities must exist first in the database")
            
            city = random.choice(cities_exist)

            user = User()
            user.email = email
            user.password = generate_password_hash("123456")
            user.is_active = True
            user.name = "Name_User_" + str(next_index)
            user.latitude = city.latitude
            user.longitude = city.longitude
            user.address = f"{city.city}, Spain"
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")
            added_count += 1
            next_index += 1

        print("All test users created")

    @app.cli.command("insert-test-places") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_places(count):
        print("Creating test places")
        place_image_urls = {
            EstablishmentType.RESTAURANT: "https://images.unsplash.com/photo-1755632540801-8eaf8eb22e1d?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            EstablishmentType.BAR: "https://images.unsplash.com/photo-1659514149185-e8f007131309?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            EstablishmentType.CAFE: "https://images.unsplash.com/photo-1571168136613-46401b03904e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        seed_addresses = [city_data[0] for city_data in cities.values()]
        added_count = 0
        next_index = 1

        while added_count < int(count):
            email = "test_place" + str(next_index) + "@test.com"
            existing_place = db.session.execute(
                select(Place).where(Place.email == email)
            ).scalar_one_or_none()

            if existing_place:
                print("Place: ", email, " already exists. Skipping.")
                next_index += 1
                continue

            seed_address = random.choice(seed_addresses)

            try:
                resolved_place_address = resolve_place_address_geocode(seed_address)
            except (ValueError, RuntimeError) as error:
                print(f"Geocoding unavailable ('{error}'). Using static city data as fallback.")
                city_name = random.choice(list(cities.keys()))
                city_tuple = cities[city_name]
                fallback_city = db.session.execute(
                    select(City).where(City.city == city_name)
                ).scalar_one_or_none()
                if fallback_city is None:
                    print(f"City '{city_name}' not in DB. Run 'flask insert-cities' first, then retry.")
                    break
                resolved_place_address = {
                    "formatted_address": city_tuple[0],
                    "latitude": city_tuple[1],
                    "longitude": city_tuple[2],
                    "city_id": fallback_city.id,
                }

            place = Place()
            place.email = email
            place.password = generate_password_hash("123456")
            place.is_active = True
            place.name = "Name_Place_" + str(next_index)
            place.establishment_type = random.choice(list(EstablishmentType))
            place.city_id = resolved_place_address["city_id"]
            place.address = resolved_place_address["formatted_address"]
            place.latitude = resolved_place_address["latitude"]
            place.longitude = resolved_place_address["longitude"]
            place.pet_rules = "Pets allowed under supervision"
            place.image_url = place_image_urls[place.establishment_type]
            place.requires_reservation_payment = random.choice([True, False])
            if place.requires_reservation_payment:
                place.reservation_price = Decimal("5.00")
            else:
                place.reservation_price = None

            db.session.add(place)
            db.session.commit()
            
            # Generate PlaceSchedules
            for day in range(7):
                schedule = PlaceSchedule(
                    place_id=place.id,
                    day_of_week=day,
                    start_time=datetime.strptime('09:00', '%H:%M').time(),
                    end_time=datetime.strptime('21:00', '%H:%M').time(),
                    is_closed=False
                )
                db.session.add(schedule)

            # Generate Tables
            for t_idx in range(1, 4):
                new_table = Table(
                    place_id=place.id,
                    name=f"Table {t_idx}",
                    capacity_people=random.choice([2, 4, 6]),
                    capacity_pets=random.choice([1, 2, 3])
                )
                db.session.add(new_table)

            db.session.commit()
            
            print("Place: ", place.email, " created with schedules and tables.")
            added_count += 1
            next_index += 1

        print("All test places created")

    @app.cli.command("insert-test-admins")
    @click.argument("count") # argument of out command
    def insert_test_admins(count):
        print("Creating test admins")
        added_count = 0
        next_index = 1

        while added_count < int(count):
            email = "test_admin" + str(next_index) + "@test.com"
            existing_admin = db.session.execute(
                select(AdminUser).where(AdminUser.email == email)
            ).scalar_one_or_none()

            if existing_admin:
                print("Admin: ", email, " already exists. Skipping.")
                next_index += 1
                continue

            admin = AdminUser()
            admin.email = email
            admin.password = generate_password_hash("123456")
            admin.is_active = True
            admin.name = "Name_Admin_" + str(next_index)
            db.session.add(admin)
            db.session.commit()
            print("Admin: ", admin.email, " created.")
            added_count += 1
            next_index += 1

        print("All test admins created")

    @app.cli.command("insert-cities") # name of our command
    def insert_cities():
        for city, city_data in cities.items():
            address, latitude, longitude = city_data
            city_exists = db.session.execute(select(City).where(City.city == city)).scalar_one_or_none()
            if not city_exists:
                add_city = City(city=city, latitude=latitude, longitude=longitude, address=address)
                db.session.add(add_city)
                db.session.commit()
                print(f"{city} added")
        
        print("All cities created")
    
    @app.cli.command("delete-cities") # name of our command
    def delete_cities():
        cities_exist = db.session.execute(select(City)).scalars().all()
        for city in cities_exist:
            db.session.delete(city)
            db.session.commit()
        
        print("All cities deleted")
    
    @app.cli.command('insert-test-favorites')
    @click.argument("count") # argument of out command
    def insert_favorites(count):
        users = db.session.execute(select(User)).scalars().all() or None
        places = db.session.execute(select(Place)).scalars().all() or None
        if users is None or places is None:
            return print('Unable to insert test favorites. Make sure users and places exist in the database')

        existing_pairs = {
            (favorite.user_id, favorite.place_id)
            for favorite in db.session.execute(select(Favorite)).scalars().all()
        }

        added_count = 0
        max_attempts = int(count) * 10
        attempts = 0

        while added_count < int(count) and attempts < max_attempts:
            attempts += 1
            user_id = random.choice(users).id
            place_id = random.choice(places).id
            pair = (user_id, place_id)

            if pair in existing_pairs:
                continue

            new_favorite = Favorite(user_id=user_id, place_id=place_id)
            db.session.add(new_favorite)
            db.session.commit()
            existing_pairs.add(pair)
            added_count += 1
            print(f"Favorite {added_count} added")

        if added_count < int(count):
            print(f"Only {added_count} unique favorites could be added with the available users and places.")

        return print("All test favorites added")
    
    @app.cli.command('insert-test-reservations')
    @click.argument("count")
    @click.option("--days-back",  default=5,  show_default=True, help="How many past days to spread reservations across")
    @click.option("--days-ahead", default=7,  show_default=True, help="How many future days to spread reservations across")
    def insert_reservations(count, days_back, days_ahead):
        users  = db.session.execute(select(User)).scalars().all()
        places = db.session.execute(select(Place)).scalars().all()

        if not users or not places:
            return print('Unable to insert test reservations. Make sure users and places exist in the database')

        zone_preferences = ["terrace", "indoor", "window", "quiet area", "garden", "bar area"]
        # Business hours: 10:00–22:00, slots on the quarter-hour
        hours   = list(range(10, 22))
        minutes = [0, 15, 30, 45]
        # Weighted statuses: mostly confirmed/pending, some cancelled
        statuses = (
            [ReservationStatus.CONFIRMED] * 5 +
            [ReservationStatus.PENDING]   * 3 +
            [ReservationStatus.CANCELLED] * 1
        )
        notes_pool = [
            "Allergic to cats — please seat away from pet area",
            "Celebrating a birthday",
            "First visit, looking forward to it!",
            "Would prefer a quiet corner",
            "Coming with a large dog, need extra space",
            "Need a highchair for a toddler",
            None,  # no notes
            None,
            None,
        ]

        today = datetime.now().date()
        date_range = [today + timedelta(days=d) for d in range(-days_back, days_ahead + 1)]

        # Half of the reservations guaranteed to fall on today so the board
        # always has something visible when the seed runs.
        half = max(1, int(count) // 2)

        for x in range(1, int(count) + 1):
            user  = random.choice(users)
            place = random.choice(places)
            user_pets = db.session.execute(select(Pet).where(Pet.user_id == user.id)).scalars().all()
            chosen_pet_id = random.choice(user_pets).id if user_pets and random.random() > 0.4 else None

            res_date = today if x <= half else random.choice(date_range)
            res_time = datetime(
                res_date.year, res_date.month, res_date.day,
                random.choice(hours), random.choice(minutes)
            ).time()

            new_reservation = Reservation(
                user_id=user.id,
                place_id=place.id,
                reservation_date=res_date,
                reservation_time=res_time,
                people_count=random.randint(1, 8),
                pet_id=chosen_pet_id,
                zone_preference=random.choice(zone_preferences),
                notes=random.choice(notes_pool),
                status=random.choice(statuses),
            )

            db.session.add(new_reservation)
            db.session.commit()
            print(f"Reservation {x}: {user.email} → {place.name}  {res_date} {res_time.strftime('%H:%M')}  [{new_reservation.status.value}]")

        return print("All test reservations added")
    
    @app.cli.command('insert-test-reviews')
    @click.argument("count") # argument of out command
    def insert_reviews(count):
        reservations_confirmed = db.session.execute(select(Reservation).where(Reservation.status == "CONFIRMED")).scalars().all() or None

        if reservations_confirmed is None:
            return print('Unable to insert test reviews. Make sure reservations with status "CONFIRMED" exist in the database')

        review_titles = [
            "Great experience",
            "Pretty good",
            "Could be better",
            "Loved it",
            "Not bad"
        ]

        review_contents = [
            "The service was friendly and everything went smoothly.",
            "Nice place and good attention overall.",
            "The reservation was fine, but there is room for improvement.",
            "Very good experience, I would definitely come back.",
            "Everything was correct and the atmosphere was pleasant."
        ]

        for x in range(1, int(count) + 1):
            reservation = random.choice(reservations_confirmed)

            new_review = Review(
                user_id=reservation.user_id,
                reservation_id=reservation.id,
                rating=random.randint(1, 5),
                title=random.choice(review_titles),
                content=random.choice(review_contents),
                created_at=datetime.now().isoformat(),
                is_active=True
            )

            db.session.add(new_review)
            db.session.commit()
            print(f"Review {x} added")

        return print("All test reviews added")

    @app.cli.command('insert-test-chat')
    @click.argument("count") # argument of out command
    def insert_chat(count):
        users = db.session.execute(select(User)).scalars().all() or None
        places = db.session.execute(select(Place)).scalars().all() or None

        if users is None or places is None:
            return print('Unable to insert test chat messages. Make sure users and places exist in the database')

        user_messages = [
            "Hi, do you have tables available for tonight?",
            "Can I bring two dogs with the reservation?",
            "Is the terrace open this evening?",
            "Do I need to book in advance for the weekend?",
            "What time do you close today?"
        ]

        place_messages = [
            "Yes, we still have availability.",
            "Of course, pets are welcome here.",
            "Yes, the terrace is open if the weather stays good.",
            "We recommend booking in advance for weekends.",
            "We close at 11 PM today."
        ]

        for x in range(1, int(count) + 1):
            user = random.choice(users)
            place = random.choice(places)
            sender = random.choice(["user", "place"])
            message = random.choice(user_messages if sender == "user" else place_messages)

            new_chat = Chat(
                user_id=user.id,
                place_id=place.id,
                message=message,
                sender=sender
            )

            db.session.add(new_chat)
            db.session.commit()
            print(f"Chat message {x} added")

        return print("All test chat messages added")

    @app.cli.command('insert-test-news')
    def insert_news():
        admins = db.session.execute(select(AdminUser)).scalars().all() or None

        if admins is None:
            return print('Unable to insert test news. Make sure admins exist in the database')

        if not admins:
            return print('Unable to insert test news. Make sure admins exist in the database')

        test_news_posts = [
            {
                "title": "Updated Pet Policy for Indoor Areas",
                "content": "We have updated our indoor pet policy to improve comfort and safety for all guests. Please keep pets close to your table and under supervision at all times.",
                "post_type": PostType.NORMATIVE
            },
            {
                "title": "New Terrace Rules for Pets",
                "content": "Pets are welcome on the terrace. We kindly ask owners to keep walkways clear and make sure pets remain calm around other guests.",
                "post_type": PostType.NORMATIVE
            },
            {
                "title": "Weekend Guidelines for Pet Owners",
                "content": "For busy weekends, we recommend arriving on time and indicating the number of pets included in your booking so our staff can prepare your table properly.",
                "post_type": PostType.NEWS
            },
            {
                "title": "Important Update on Vaccination Requirements",
                "content": "To ensure a safe environment, we may request that pets are up to date on their basic vaccinations before entering shared dining areas.",
                "post_type": PostType.NORMATIVE
            },
            {
                "title": "Pet-Friendly Space Improvements",
                "content": "We are introducing small improvements in our pet-friendly spaces, including water stations and clearer seating guidelines for guests visiting with animals.",
                "post_type": PostType.EVENT
            }
        ]

        existing_titles = {
            news.title
            for news in db.session.execute(select(News)).scalars().all()
        }

        created_count = 0

        for news_data in test_news_posts:
            if news_data["title"] in existing_titles:
                print(f'News post "{news_data["title"]}" already exists. Skipping.')
                continue

            new_post = News(
                id_admin=random.choice(admins).id,
                title=news_data["title"],
                content=news_data["content"],
                post_date=datetime.now().date(),
                post_type=news_data["post_type"]
            )

            db.session.add(new_post)
            db.session.commit()
            created_count += 1
            print(f'News post "{new_post.title}" added')

        return print(f"Test news sync complete. {created_count} new posts added.")

    @app.cli.command("sync-pet-urls")
    def sync_pet_urls():
        """Copy race.url into pet.url for any pet that has no url but belongs to a race with one."""
        pets = db.session.execute(
            select(Pet).options(joinedload(Pet.race)).where(Pet.url == None)
        ).unique().scalars().all()
        updated = 0
        for pet in pets:
            if pet.race and pet.race.url:
                pet.url = pet.race.url
                updated += 1
        db.session.commit()
        print(f"sync-pet-urls: updated {updated} pets.")

    @app.cli.command("insert-external-races")
    def insert_external_races():
        import os
        print("Fetching races from The Dog API...")
        try:
            api_key = os.getenv("DOG_API_KEY")
            headers = {"x-api-key": api_key} if api_key else {}
            dog_res = requests.get('https://api.thedogapi.com/v1/breeds', headers=headers)
            if dog_res.status_code == 200:
                dogs = dog_res.json()
                dog_count = 0
                for dog in dogs:
                    name = dog.get('name')
                    image_url = dog.get('image', {}).get('url')
                    if name:
                        exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                        if not exists:
                            new_race = Race(name=name, animal_type="Perro", url=image_url)
                            db.session.add(new_race)
                            dog_count += 1
                        elif image_url and not exists.url:
                            # Update existing race that has no URL yet
                            exists.url = image_url
                db.session.commit()
                print(f"Inserted/updated {dog_count} dog races.")
            else:
                print(f"Unable to connect to The Dog API ({dog_res.status_code}). Using fallback list...")
                # Build slug→CDN URL from Dog CEO API for each fallback breed
                fallback_dogs = [
                    ("Golden Retriever",    "goldenretriever"),
                    ("Labrador Retriever",  "labrador"),
                    ("Bulldog",             "bulldog/english"),
                    ("Poodle",              "poodle/standard"),
                    ("Beagle",              "beagle"),
                    ("Chihuahua",           "chihuahua"),
                    ("German Shepherd",     "germanshepherd"),
                    ("Yorkshire Terrier",   "yorkshire"),
                    ("Boxer",               "boxer"),
                    ("Husky",               "husky"),
                    ("Pomeranian",          "pomeranian"),
                    ("Dachshund",           "dachshund"),
                    ("Pug",                 "pug"),
                    ("Cocker Spaniel",      "spaniel/cocker"),
                    ("Rottweiler",          "rottweiler"),
                    ("Doberman",            "doberman"),
                    ("Border Collie",       "collie/border"),
                ]
                dog_count = 0
                for name, slug in fallback_dogs:
                    exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                    # Try to get image from Dog CEO API
                    image_url = None
                    try:
                        ceo_res = requests.get(f'https://dog.ceo/api/breed/{slug}/images/random', timeout=5)
                        if ceo_res.status_code == 200:
                            image_url = ceo_res.json().get('message')
                    except Exception:
                        pass
                    if not exists:
                        new_race = Race(name=name, animal_type="Perro", url=image_url)
                        db.session.add(new_race)
                        dog_count += 1
                    elif image_url and not exists.url:
                        exists.url = image_url
                db.session.commit()
                print(f"Inserted/updated {dog_count} dog races from fallback list.")
        except Exception as e:
            print(f"Dog API exception: {e}")

        print("Fetching races from The Cat API...")
        try:
            cat_api_key = os.getenv("CAT_API_KEY", "")
            cat_headers = {"x-api-key": cat_api_key} if cat_api_key else {}
            cat_res = requests.get('https://api.thecatapi.com/v1/breeds', headers=cat_headers)
            if cat_res.status_code == 200:
                cats = cat_res.json()
                cat_count = 0
                for cat in cats:
                    name = cat.get('name')
                    image_url = cat.get('image', {}).get('url')
                    if name:
                        exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Gato")).scalars().first()
                        if not exists:
                            new_race = Race(name=name, animal_type="Gato", url=image_url)
                            db.session.add(new_race)
                            cat_count += 1
                        elif image_url and not exists.url:
                            exists.url = image_url
                db.session.commit()
                print(f"Inserted/updated {cat_count} cat races.")
            else:
                print(f"Unable to connect to The Cat API ({cat_res.status_code}).")
        except Exception as e:
            print(f"Cat API exception: {e}")

    @app.cli.command('insert-test-pets')
    @click.argument("count")
    def insert_test_pets(count):
        users = db.session.execute(select(User)).scalars().all() or None
        races = db.session.execute(select(Race)).scalars().all() or None

        if users is None:
            return print("Unable to insert test pets. Make sure users exist in the database")

        if not users:
            return print("Unable to insert test pets. Make sure users exist in the database")

        dog_races = [race for race in races if race.animal_type == "Perro"] if races else []
        cat_races = [race for race in races if race.animal_type == "Gato"] if races else []

        other_pet_types = [
            "Parrot",
            "Rabbit",
            "Hamster",
            "Turtle",
            "Ferret"
        ]
        other_pet_type_urls = {
            "parrot": "https://images.unsplash.com/photo-1693218722743-eba71402ab37",
            "rabbit": "https://images.unsplash.com/photo-1589933767411-38a58367efd7",
            "turtle": "https://images.unsplash.com/photo-1644776986545-a3b246aa77a0",
            "hamster": "https://images.unsplash.com/photo-1738486310390-7d5bf189b98a",
            "ferret": "https://images.unsplash.com/photo-1615087240969-eeff2fa558f2"
        }
        pet_names = [
            "Max",
            "Luna",
            "Charlie",
            "Bella",
            "Rocky",
            "Milo",
            "Coco",
            "Nala"
        ]

        for x in range(1, int(count) + 1):
            user = random.choice(users)
            animal_type = random.choice(list(PetAnimalType))
            race_id = None
            other_type = None
            pet_url = None

            if animal_type == PetAnimalType.DOG and dog_races:
                selected_race = random.choice(dog_races)
                race_id = selected_race.id
                pet_url = selected_race.url
            elif animal_type == PetAnimalType.CAT and cat_races:
                selected_race = random.choice(cat_races)
                race_id = selected_race.id
                pet_url = selected_race.url
            else:
                animal_type = PetAnimalType.OTHER
                other_type = random.choice(other_pet_types)
                pet_url = other_pet_type_urls.get(other_type.lower())

            new_pet = Pet(
                name=f"{random.choice(pet_names)}_{x}",
                user_id=user.id,
                animal_type=animal_type,
                other_type=other_type,
                race_id=race_id,
                size=random.choice(list(PetSize)),
                url=pet_url
            )

            db.session.add(new_pet)
            db.session.commit()
            print(f"Pet {x} added")

        return print("All test pets added")
