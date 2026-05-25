from django.contrib import admin
from django.urls import path, include
from users.views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', RegisterView.as_view(), name="user-register"),
    path('api/user/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/tickets/', include('tickets.urls')),
    path('api/departments/', include('departments.urls')),
    path('api/ai/', include('ai.urls')),
    path('api/users/', include('users.urls')),
    path("api-auth", include("rest_framework.urls")),
]
