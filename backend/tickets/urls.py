from django.urls import path
from .views import TicketListEmployeeView, CreateTicketView, ListTicketView, DetailTicketView, UpdateSymptomCodeView, UpdateTicketView, DeleteTicketView, CreateCategoryView, KeywordUpdateView ,KeywordCreateView, UpdateCategoryView, CreateSymptomCodeView, SLARulesCreateView, SLARulesUpdateView

urlpatterns = [
    # --- Ticket URLs ---
    path('create/', CreateTicketView.as_view(), name='create-ticket'),
    path('list/', ListTicketView.as_view(), name='list-tickets'),
    path('detail/<int:pk>/', DetailTicketView.as_view(), name='detail-ticket'),
    path('update/<int:pk>/', UpdateTicketView.as_view(), name='update-ticket'),
    path('delete/<int:pk>/', DeleteTicketView.as_view(), name='delete-ticket'),
    path('employee/list/', TicketListEmployeeView.as_view(), name="ticket-list"),
    
    # --- Category URLs ---
    path('categories/create/', CreateCategoryView.as_view(), name='create-category'),
    path('categories/update/<int:pk>/', UpdateCategoryView.as_view(), name='update-category'),

    # --- Symptom Code URLs ---
    path('symptom-codes/create/', CreateSymptomCodeView.as_view(), name='create-symptom-code'),

    # --- SLA Rules URLs ---
    path('sla-rules/create/', SLARulesCreateView.as_view(), name='create-sla-rules'),
    path('sla-rules/update/<int:pk>/', SLARulesUpdateView.as_view(), name='update-sla-rules'),

    # --- Keyword URLs ---
    path('keywords/create/', KeywordCreateView.as_view(), name='create-keyword'),
    path('keywords/update/<int:pk>/', KeywordUpdateView.as_view(), name='update-keyword'),

    # --- Symptom Code URLs ---
    path('symptom-codes/update/<int:pk>/', UpdateSymptomCodeView.as_view(), name='update-symptom-code'),
    # path('<int:ticket_id>/assignees/add/', AddTicketAssigneeView.as_view(), name='add-ticket-assignee'),
    # path('<int:ticket_id>/assignees/update/', UpdateTicketAssigneeView.as_view(), name='update-ticket-assignee'),
]