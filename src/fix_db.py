from app import app, db
with app.app_context():
    db.session.execute(db.text("UPDATE places SET establishment_type='RESTAURANT' WHERE establishment_type='restaurant'"))
    db.session.execute(db.text("UPDATE places SET establishment_type='BAR' WHERE establishment_type='bar'"))
    db.session.execute(db.text("UPDATE places SET establishment_type='CAFE' WHERE establishment_type='cafe'"))
    db.session.commit()
    print("Fixed!")
