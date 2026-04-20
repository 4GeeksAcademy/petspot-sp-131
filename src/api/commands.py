
import click, random
from api.cities import cities
from api.models import db, User, Place, EstablishmentType, City
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
        existing_cities = db.session.execute(select(City)).scalars().all() or None
        if existing_cities is None:
            return print("Unable to add places. Cities must exist first in the database")
        for x in range(1, int(count) + 1):
            place = Place()
            place.email = "test_place" + str(x) + "@test.com"
            place.password = generate_password_hash("123456")
            place.name = "Place_" + str(x)
            place.establishment_type = random.choice(list(EstablishmentType))
            place.city = random.choice(existing_cities)
            place.pet_rules = "Pets allowed under supervision"
            db.session.add(place)
            db.session.commit()
            print("Place: ", place.email, " created.")

        print("All test places created")

    @app.cli.command("insert-cities") # name of our command
    def insert_cities():
        for city in cities:
            city_exists = db.session.execute(select(City).where(City.city == city)).scalar_one_or_none()
            if not city_exists:
                add_city = City(city=city)
                db.session.add(add_city)
                db.session.commit()
            print(f"{city} already exists")
        
        print("All cities created")
    
    @app.cli.command("delete-cities") # name of our command
    def delete_cities():
        cities_exist = db.session.execute(select(City)).scalars().all()
        for city in cities_exist:
            db.session.delete(city)
            db.session.commit()
        
        print("All cities deleted")


    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass
