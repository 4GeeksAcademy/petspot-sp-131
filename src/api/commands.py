
import click, random
from api.models import db, User, Place, EstablishmentType, Location
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
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-places") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_places(count):
        print("Creating test places")
        for x in range(1, int(count) + 1):
            place = Place()
            place.email = "test_place" + str(x) + "@test.com"
            place.password = generate_password_hash("123456")
            place.name = "Place_" + str(x)
            place.establishment_type = random.choice(list(EstablishmentType))
            place.pet_rules = "Pets allowed under supervision"
            db.session.add(place)
            db.session.commit()
            print("Place: ", place.email, " created.")

        print("All test places created")

    @app.cli.command("insert-test-locations") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_locations(count):
        print("Creating test locations based on existing places")
        cities = ["Madrid", "Barcelona", "Granada", "Valencia"]
        count = int(count)

        if count <= 0:
            print("Count must be greater than 0.")
            return

        places = db.session.execute(select(Place)).scalars().all()

        if not places:
            print("No places found. Create places before inserting locations.")
            return

        all_combinations = []
        for place in places:
            for city in cities:
                all_combinations.append((place, city))

        if count > len(all_combinations):
            print(f"Only creating {len(all_combinations)} locations because that is the maximum number of unique combinations.")
            count = len(all_combinations)

        selected_combinations = random.sample(all_combinations, count)

        for place, city in selected_combinations:
            location = Location()
            location.city = city
            location.place = place
            db.session.add(location)
            print(f"Location for {place.name} in {city} created.")

        db.session.commit()

        print("All test locations created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass
