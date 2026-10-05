import zoneinfo

from django.utils import timezone


class BrowserTimezoneMiddleware:
    """Uses the timezone the planner page stores in the `tz` cookie, so dates match the device."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        name = request.COOKIES.get('tz')
        try:
            timezone.activate(zoneinfo.ZoneInfo(name)) if name else timezone.deactivate()
        except (zoneinfo.ZoneInfoNotFoundError, ValueError):
            timezone.deactivate()
        return self.get_response(request)
