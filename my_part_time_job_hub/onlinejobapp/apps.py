from django.apps import AppConfig
<<<<<<< HEAD
import firebase_admin
from firebase_admin import credentials
from django.conf import settings


class OnlinejobappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "onlinejobapp"

    def ready(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(
                cred, {"databaseURL": settings.FIREBASE_DATABASE_URL}
            )
=======


class OnlinejobappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'onlinejobapp'
>>>>>>> origin/frontend/login_register
