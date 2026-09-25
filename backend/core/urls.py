from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from users.views import RegisterView, CustomTokenView, LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def home(request):
    return JsonResponse({
        "message": "ITSM Ticketing System API is running."
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", home),
    path('api/user/register/', RegisterView.as_view(), name="user-register"),
    path('api/user/token/', CustomTokenView.as_view(), name='token_obtain_pair'),
    path('api/user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/logout/',LogoutView.as_view(), name='user-logout',),
    path('api/tickets/', include('tickets.urls')),
    path('api/departments/', include('departments.urls')),
    path('api/ai/', include('ai.urls')),
    path('api/users/', include('users.urls')),
    path("api-auth", include("rest_framework.urls")),
]
