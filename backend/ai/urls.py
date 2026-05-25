from django.urls import path
from .views import TestAIView

urlpatterns = [
    path("test/<int:ticket_id>/", TestAIView.as_view(), name="test-ai"),
]