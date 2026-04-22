import os
import inspect
from flask_admin import Admin
from . import models
from .models import db
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme


class AdminModelView(ModelView):
    column_display_pk = True


class ReservationAdminModelView(ModelView):
    column_display_pk = True
    form_excluded_columns = ['reviews']


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='4Geeks Admin', theme=Bootstrap4Theme(swatch='cerulean'))

    for name, obj in inspect.getmembers(models):
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            if obj == models.Reservation:
                admin.add_view(ReservationAdminModelView(obj, db.session))
            else:
                admin.add_view(AdminModelView(obj, db.session))