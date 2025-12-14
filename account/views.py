from django.http import JsonResponse


def home_page_view(request):
    data = {
        "message": "Hello, World!"
    }
    return JsonResponse(data)
