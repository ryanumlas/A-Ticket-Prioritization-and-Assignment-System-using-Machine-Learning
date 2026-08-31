from django.urls import path
from .views import (TicketListEmployeeView, CreateTicketView, ListTicketView, DetailTicketView, UpdateSymptomCodeView, 
UpdateTicketView, DeleteTicketView, CreateCategoryView, KeywordUpdateView ,KeywordCreateView, 
UpdateCategoryView, CreateSymptomCodeView, SLARulesCreateView, SLARulesUpdateView, TicketDetailEmployeeView, TicketListServiceDeskView, UpdateTicketStatusView, ManualOverrideTicketView,
ServiceDeskOverviewView, ServiceDeskClassifiedResultsView, FlaggedTicketsListView, FlaggedTicketDetailView, SymptomCodeListView, 
AcceptRecommendationView, ApproveOverrideView, ManuallyClassifyView, SupportOverviewView, TicketQueueView, TicketListSupportView, DepartmentSymptomCodesView, SLAPerformanceView)

urlpatterns = [
    # --- Ticket URLs ---
    path('create/', CreateTicketView.as_view(), name='create-ticket'),
    path('list/', ListTicketView.as_view(), name='list-tickets'),
    path('detail/<int:pk>/', DetailTicketView.as_view(), name='detail-ticket'),
    path('update/<int:pk>/', UpdateTicketView.as_view(), name='update-ticket'),
    path('update-status/<int:pk>/', UpdateTicketStatusView.as_view(), name='update-ticket-status'),
    path('manual-override/<int:pk>/', ManualOverrideTicketView.as_view(), name='manual-override-ticket'),
    path('delete/<int:pk>/', DeleteTicketView.as_view(), name='delete-ticket'),
    path("sla-performance/",SLAPerformanceView.as_view(),name="support-sla-performance",),

    path('employee/list/', TicketListEmployeeView.as_view(), name="ticket-list"),
    path('employee/detail/<int:ticket_id>/', TicketDetailEmployeeView.as_view(), name="ticket-detail"),

    path('service-desk/list/', TicketListServiceDeskView.as_view(), name="ticket-list-service-desk"),
    path('service-desk/overview/', ServiceDeskOverviewView.as_view(), name="service-desk-overview"),
    path('service-desk/classified-results/', ServiceDeskClassifiedResultsView.as_view(), name="service-desk-classified-results"),
    path('flagged/list/', FlaggedTicketsListView.as_view(), name='flagged-tickets'),
    path('flagged-detail/<int:pk>/', FlaggedTicketDetailView.as_view(), name='flagged-ticket-detail'),
    path("flagged/<int:pk>/accept-recommendation/", AcceptRecommendationView.as_view(), name="accept-recommendation"),
    path('flagged/<int:pk>/approve-override/', ApproveOverrideView.as_view(), name='approve-override'),
    path('flagged/<int:pk>/manual-classify/', ManuallyClassifyView.as_view(), name='manual-classify'),

    path('support-specialist/overview/', SupportOverviewView.as_view(), name='support-overview'),
    path('support-specialist/list/', TicketListSupportView.as_view(), name='support-list'),
    path('ticket-queue/list/', TicketQueueView.as_view(), name='support-ticket-queue'),
    # --- Category URLs ---
    path('categories/create/', CreateCategoryView.as_view(), name='create-category'),
    path('categories/update/<int:pk>/', UpdateCategoryView.as_view(), name='update-category'),

    # --- Symptom Code URLs ---
    path('symptom-code/create/', CreateSymptomCodeView.as_view(), name='create-symptom-code'),
    path('symptom-code/list/', SymptomCodeListView.as_view(), name='symptom-code-list'),
    path("symptom-codes/ticket-queue/", DepartmentSymptomCodesView.as_view(), name="ticket-queue-symptom-codes",),

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