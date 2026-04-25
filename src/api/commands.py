
import click, random, requests
from api.cities import cities
from datetime import datetime
from api.models import db, User, Place, EstablishmentType, City, Favorite, AdminUser, Review, Reservation, ReservationStatus, Chat, News, PostType, Race
from werkzeug.security import generate_password_hash
from sqlalchemy import select

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

    @app.cli.command("insert-test-places") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_places(count):
        print("Creating test places")
        existing_cities = db.session.execute(select(City)).scalars().all() or None
        if existing_cities is None:
            return print("Unable to add places. Cities must exist first in the database")
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

            place = Place()
            place.email = email
            place.password = generate_password_hash("123456")
            place.name = "Name_Place_" + str(next_index)
            place.establishment_type = random.choice(list(EstablishmentType))
            place.city = random.choice(existing_cities)
            place.pet_rules = "Pets allowed under supervision"
            db.session.add(place)
            db.session.commit()
            print("Place: ", place.email, " created.")
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
        for city in cities:
            city_exists = db.session.execute(select(City).where(City.city == city)).scalar_one_or_none()
            if not city_exists:
                add_city = City(city=city)
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
    @click.argument("count") # argument of out command
    def insert_reservations(count):
        users = db.session.execute(select(User)).scalars().all() or None
        places = db.session.execute(select(Place)).scalars().all() or None

        if users is None or places is None:
            return print('Unable to insert test reservations. Make sure users and places exist in the database')

        zone_preferences = ["terrace", "indoor", "window", "quiet area"]

        for x in range(1, int(count) + 1):
            user = random.choice(users)
            place = random.choice(places)

            new_reservation = Reservation(
                user_id=user.id,
                place_id=place.id,
                reservation_date=datetime.now().date(),
                reservation_time=datetime.now().time().replace(second=0, microsecond=0),
                people_count=random.randint(1, 6),
                pet_count=random.randint(0, 3),
                zone_preference=random.choice(zone_preferences),
                notes="Test reservation created from CLI command",
                status=ReservationStatus.CONFIRMED
            )

            db.session.add(new_reservation)
            db.session.commit()
            print(f"Reservation {x} added")

        return print("All test reservations added")
    
    @app.cli.command('insert-test-reviews')
    @click.argument("count") # argument of out command
    def insert_reviews(count):
        reservations = db.session.execute(select(Reservation)).scalars().all() or None

        if reservations is None:
            return print('Unable to insert test reviews. Make sure reservations exist in the database')

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
            reservation = random.choice(reservations)

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

        for news_data in enumerate(test_news_posts):
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

    
    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass

    @app.cli.command("insert-external-races")
    def insert_external_races():
        import os
        print("Buscando razas en The Dog API...")
        try:
            api_key = os.getenv("DOG_API_KEY")
            headers = {"x-api-key": api_key} if api_key else {}
            dog_res = requests.get('https://api.thedogapi.com/v1/breeds', headers=headers)
            if dog_res.status_code == 200:
                dogs = dog_res.json()
                dog_count = 0
                for dog in dogs:
                    name = dog.get('name')
                    if name:
                        exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                        if not exists:
                            new_race = Race(name=name, animal_type="Perro")
                            db.session.add(new_race)
                            dog_count += 1
                db.session.commit()
                print(f"Insertadas {dog_count} razas de Perro.")
            else:
                print(f"Error al conectar con The Dog API ({dog_res.status_code}). Usando lista de respaldo...")
                fallback_dogs = [
                    "Golden Retriever", "Labrador Retriever", "Bulldog", "Poodle", 
                    "Beagle", "Chihuahua", "German Shepherd", "Yorkshire Terrier", 
                    "Boxer", "Husky", "Pomeranian", "Dachshund", "Pug", 
                    "Cocker Spaniel", "Rottweiler", "Doberman", "Pitbull", "Border Collie"
                ]
                dog_count = 0
                for name in fallback_dogs:
                    exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                    if not exists:
                        new_race = Race(name=name, animal_type="Perro")
                        db.session.add(new_race)
                        dog_count += 1
                db.session.commit()
                print(f"Insertadas {dog_count} razas de Perro (respaldo).")
        except Exception as e:
            print(f"Excepcion The Dog API: {e}")

        print("Buscando razas en The Cat API...")
        try:
            cat_res = requests.get('https://api.thecatapi.com/v1/breeds')
            if cat_res.status_code == 200:
                cats = cat_res.json()
                cat_count = 0
                for cat in cats:
                    name = cat.get('name')
                    if name:
                        exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Gato")).scalars().first()
                        if not exists:
                            new_race = Race(name=name, animal_type="Gato")
                            db.session.add(new_race)
                            cat_count += 1
                db.session.commit()
                print(f"Insertadas {cat_count} razas de Gato.")
            else:
                print("Error al conectar con The Cat API")
        except Exception as e:
            print(f"Excepcion The Cat API: {e}")
