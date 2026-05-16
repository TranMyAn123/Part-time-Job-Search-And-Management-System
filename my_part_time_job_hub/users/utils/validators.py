import re


def validation_password(password):
    if not re.match(r"^[A-Za-z](?=.*?[0-9])(?=.*?[A-Za-z]).{8,24}$", password):
        return False
    return True
