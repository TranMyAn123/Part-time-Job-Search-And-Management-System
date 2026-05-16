from django.db.models import Q


def create_search_query(query, fields):
    if not query:
        return Q()
    q_object = Q()

    for field in fields:
        q_object |= Q(**{f"{field}__icontains": query})

    return q_object
