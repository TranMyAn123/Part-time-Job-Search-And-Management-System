from django.apps import AppConfig
import firebase_admin
from firebase_admin import credentials
from django.conf import settings
import json


class OnlinejobappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "onlinejobapp"

    def ready(self):
        if not firebase_admin._apps:
            firebase_credentials = json.loads(settings.FIREBASE_CREDENTIALS)
            cred = credentials.Certificate(firebase_credentials)
            firebase_admin.initialize_app(
                cred, {"databaseURL": settings.FIREBASE_DATABASE_URL}
            )
