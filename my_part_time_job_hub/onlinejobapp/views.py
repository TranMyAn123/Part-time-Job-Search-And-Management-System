import json
from oauth2_provider.views import TokenView
from django.conf import settings


class CustomTokenView(TokenView):
    def post(self, request, *args, **kwargs):

        try:
            data = json.loads(request.body)
        except:
            data = {}

        print("PARSED:", data)

        data["client_id"] = settings.CLIENT_KEY
        data["client_secret"] = settings.CLIENT_SECRET
        request._body = json.dumps(data).encode("utf-8")

        print("FINAL BODY:", request._body)

        return super().post(request, *args, **kwargs)
