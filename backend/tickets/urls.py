from django.urls import path
from .views import CategoryListView, ManualPriorityUpdateView, ManualSymptomCodeUpdateView, PendingClarificationRequestView, RequestClarificationView, ResubmitClarificationView, SLAReportView, SLARulesListView, SupervisorReportsExcelExportView, SystemAdOverviewView, SystemAdUserChartView, TeamWorkloadView, TicketReportView
from .views import (TicketListEmployeeView, CreateTicketView, ListTicketView, DetailTicketView, UpdateSymptomCodeView, 
UpdateTicketView, DeleteTicketView, CreateCategoryView, KeywordUpdateView ,KeywordCreateView, 
UpdateCategoryView, CreateSymptomCodeView, SLARulesCreateView, SLARulesUpdateView, TicketDetailEmployeeView, TicketListServiceDeskView, UpdateTicketStatusView, ManualOverrideTicketView,
ServiceDeskOverviewView, ServiceDeskClassifiedResultsView, FlaggedTicketsListView, FlaggedTicketDetailView, SymptomCodeListView, 
AcceptRecommendationView, ApproveOverrideView, ManuallyClassifyView, SupportOverviewView, TicketQueueView, TicketListSupportView, DepartmentSymptomCodesView, AssignTicketToMeView,
SLAPerformanceView, TicketsByCategoryView, TicketDetailSupportView, TicketStatusHistoryView, TicketCommentListCreateView, RequestTicketAssistanceView, RequestTicketReopenView, ReopenRequestsListView, ReviewTicketReopenRequestView,
PriorityChangeRequestView, PriorityChangeRequestListView, PriorityRequestDetailView, ApprovePriorityRequestView, ReturnTicketView, CancelTicketAssistanceRequestView,
ReturnedTicketRequestListView, ReturnedTicketDetailRetrieve, ApproveReturnTicketView, PendingPriorityRequestCountView, PendingReturnTicketRequestCountView, CompleteTicketAssistanceView,
ServiceDeskDepartmentQueueView, EscalateTicketView, AcceptPriorityView, OverridePriorityView,SLARulesListView, CategoryListView, AssistanceQueueListView, AssistedTicketListView,
ServiceDeskDepartmentSymptomCodesView, ServiceDeskDepartmentListView, RejectReturnTicketView, ServiceDeskSLAPerformanceView,
TicketDetailSupervisorView, AcknowledgeEscalationView, AcceptTicketAssistanceView,
RejectPriorityRequestView, EmployeeCurrentActiveTicketView, SupervisorEscalatedTicketsView, CompleteEscalationView, TicketCommentMarkReadView, TicketDetailServiceDeskView)

urlpatterns = [
    # --- Ticket URLs ---
    path('create/', CreateTicketView.as_view(), name='create-ticket'),
    path('list/', ListTicketView.as_view(), name='list-tickets'),
    path('detail/<int:pk>/', DetailTicketView.as_view(), name='detail-ticket'),
    path("supervisor/detail/<int:ticket_id>/", TicketDetailSupervisorView.as_view(),),
    path('update/<int:pk>/', UpdateTicketView.as_view(), name='update-ticket'),
    path('update-status/<int:pk>/', UpdateTicketStatusView.as_view(), name='update-ticket-status'),
    path('manual-override/<int:pk>/', ManualOverrideTicketView.as_view(), name='manual-override-ticket'),
    path('delete/<int:pk>/', DeleteTicketView.as_view(), name='delete-ticket'),
    path("sla-performance/",SLAPerformanceView.as_view(),name="support-sla-performance"),
    path("<int:pk>/comments/",TicketCommentListCreateView.as_view(),name="ticket-comments"),
    path("priority-change-request/<int:pk>/",PriorityChangeRequestView.as_view(),name="priority-change-request"),
    path("priority-change-requests/reject/<int:request_id>/", RejectPriorityRequestView.as_view(), name="reject-priority-request",),
    path("priority-change-requests/list/", PriorityChangeRequestListView.as_view(), name="priority-change-request-list"),
    path("priority-change-requests/detail/<int:request_id>/", PriorityRequestDetailView.as_view(), name="priority-change-request-detail"),
    path("return-ticket/<int:pk>/",ReturnTicketView.as_view(),name="return-ticket"),
    path("return-ticket/list/", ReturnedTicketRequestListView.as_view(), name="returned-ticket-requests"),
    path("return-ticket/<int:pk>/reject/", RejectReturnTicketView.as_view(), name="reject-return-ticket",),
    path("return-ticket/<int:pk>/detail/", ReturnedTicketDetailRetrieve.as_view(), name="returned-ticket-detail"),
    path("return-ticket/<int:pk>/approve/", ApproveReturnTicketView.as_view(), name="approve-return-ticket"),
    path("priority-change-requests/approve/<int:request_id>/", ApprovePriorityRequestView.as_view(), name="approve-priority-request"),
    path('employee/list/', TicketListEmployeeView.as_view(), name="ticket-list"),
    path('employee/detail/<int:ticket_id>/', TicketDetailEmployeeView.as_view(), name="ticket-detail"),
    path("service-desk/sla-performance/",ServiceDeskSLAPerformanceView.as_view(),name="service-desk-sla-performance",),
    path('service-desk/list/', TicketListServiceDeskView.as_view(), name="ticket-list-service-desk"),
    path('service-desk/overview/', ServiceDeskOverviewView.as_view(), name="service-desk-overview"),
    path('service-desk/classified-results/', ServiceDeskClassifiedResultsView.as_view(), name="service-desk-classified-results"),
    path('service-desk/detail/<int:ticket_id>/', TicketDetailServiceDeskView.as_view(), name="service-desk-detail"),
    path('flagged/list/', FlaggedTicketsListView.as_view(), name='flagged-tickets'),
    path('flagged-detail/<int:pk>/', FlaggedTicketDetailView.as_view(), name='flagged-ticket-detail'),
    path("flagged/<int:pk>/accept-recommendation/", AcceptRecommendationView.as_view(), name="accept-recommendation"),
    path('flagged/<int:pk>/approve-override/', ApproveOverrideView.as_view(), name='approve-override'),
    path('flagged/<int:pk>/manual-classify/', ManuallyClassifyView.as_view(), name='manual-classify'),
    path("flagged/<int:pk>/accept-priority/", AcceptPriorityView.as_view(), name="accept-priority",),
    path("flagged/<int:pk>/override-priority/", OverridePriorityView.as_view(), name="override-priority",),
    path("flagged/<int:ticket_id>/request-clarification/",RequestClarificationView.as_view(),name="request-clarification",),
    path("flagged/<int:ticket_id>/resubmit/",ResubmitClarificationView.as_view(),name="resubmit-clarification",),
    path("clarification-requests/pending/",PendingClarificationRequestView.as_view(),name="pending-clarification-request",),

    path("support/detail/<int:ticket_id>/", TicketDetailSupportView.as_view(), name="support-ticket-detail",),
    path('support-specialist/overview/', SupportOverviewView.as_view(), name='support-overview'),
    path('support-specialist/list/', TicketListSupportView.as_view(), name='support-list'),
    path('ticket-queue/list/', TicketQueueView.as_view(), name='support-ticket-queue'),

    path("<int:pk>/history/", TicketStatusHistoryView.as_view(), name="ticket-history"),
    path("service-desk/department-queue/",ServiceDeskDepartmentQueueView.as_view(),name="service-desk-department-queue"),
    path("service-desk/department-symptom-codes/",ServiceDeskDepartmentSymptomCodesView.as_view(),name="service-desk-department-symptom-codes",),
    path('service-desk/departments/', ServiceDeskDepartmentListView.as_view(), name="service-desk-department-list"),

    path("return-ticket/pending-count/",PendingReturnTicketRequestCountView.as_view(),name="pending-return-ticket-count",),
    path("priority-request/pending-count/",PendingPriorityRequestCountView.as_view(),name="pending-priority-request-count",),

    path("employee/current-active/",EmployeeCurrentActiveTicketView.as_view(), name="employee-current-active-ticket",),

    path("escalate/<int:pk>/", EscalateTicketView.as_view(), name="escalate-ticket"),
    path("complete-escalation/<int:pk>/", CompleteEscalationView.as_view(), name="escalate-ticket-complete"),
    path("supervisor/escalated/list/",SupervisorEscalatedTicketsView.as_view(), name="escalated-ticket-list"),
    path("acknowledge-escalation/<int:pk>/",AcknowledgeEscalationView.as_view(),),

    path("<int:pk>/comments/mark-read/", TicketCommentMarkReadView.as_view(),name="ticket-comment-mark-read",),

    path("team-workload/",TeamWorkloadView.as_view(),),

    path("assign-to-me/<int:pk>/", AssignTicketToMeView.as_view(), name="assign-ticket-to-me",),
    path(
        "<int:pk>/reopen-request/",
        RequestTicketReopenView.as_view(),
        name="ticket-reopen-request",
    ),
    path(
        "reopen-requests/",
        ReopenRequestsListView.as_view(),
        name="reopen-requests-list",
    ),
    path(
        "reopen-requests/<int:pk>/review/",
        ReviewTicketReopenRequestView.as_view(),
        name="ticket-reopen-request-review",
    ),
    path("admin/overview/",SystemAdOverviewView.as_view(),name="system-admin-overview",),
    path("admin/user-chart/",SystemAdUserChartView.as_view(),name="system-admin-user-chart",),

    path("<int:pk>/priority/",ManualPriorityUpdateView.as_view(),name="manual-priority-update",),
    path("<int:pk>/symptom-code/",ManualSymptomCodeUpdateView.as_view(),name="manual-symptom-code-update",),
    # --- Assistance ---
    path("assistance/<int:ticket_id>/request/", RequestTicketAssistanceView.as_view(), name="request-ticket-assistance",),
    path("assistance/queue/list/", AssistanceQueueListView.as_view(),name="assistance-queue",),
    path("assistance/request/<int:request_id>/accept/", AcceptTicketAssistanceView.as_view(),name="accept-ticket-assistance",),
    path("assistance/assisted/list/", AssistedTicketListView.as_view(), name="assisted-ticket-list",),
    path("assistance/request/<int:request_id>/cancel/",CancelTicketAssistanceRequestView.as_view(),name="cancel-ticket-assistance-request",),
    path("assistance/<int:assistance_id>/complete/",CompleteTicketAssistanceView.as_view(),name="complete-ticket-assistance",),
    # --- Category URLs ---
    path('categories/list/', CategoryListView.as_view(), name='list-category'),
    path('categories/create/', CreateCategoryView.as_view(), name='create-category'),
    path('categories/list/', CategoryListView.as_view(), name='list-categories'),
    path('categories/update/<int:pk>/', UpdateCategoryView.as_view(), name='update-category'),
    path("tickets-by-category/", TicketsByCategoryView.as_view(), name="tickets-by-category",),

    # --- Symptom Code URLs ---
    path('symptom-code/create/', CreateSymptomCodeView.as_view(), name='create-symptom-code'),
    path('symptom-code/list/', SymptomCodeListView.as_view(), name='symptom-code-list'),
    path("symptom-codes/ticket-queue/", DepartmentSymptomCodesView.as_view(), name="ticket-queue-symptom-codes",),

    # --- SLA Rules URLs ---
    path('sla-rules/list/', SLARulesListView.as_view(), name='list-sla-rules'),
    path('sla-rules/create/', SLARulesCreateView.as_view(), name='create-sla-rules'),
    path('sla-rules/list/', SLARulesListView.as_view(), name='list-sla-rules'),
    path('sla-rules/update/<int:pk>/', SLARulesUpdateView.as_view(), name='update-sla-rules'),

    # --- Keyword URLs ---
    path('keywords/create/', KeywordCreateView.as_view(), name='create-keyword'),
    path('keywords/update/<int:pk>/', KeywordUpdateView.as_view(), name='update-keyword'),

    # --- Symptom Code URLs ---
    path('symptom-codes/update/<int:pk>/', UpdateSymptomCodeView.as_view(), name='update-symptom-code'),
    # path('<int:ticket_id>/assignees/add/', AddTicketAssigneeView.as_view(), name='add-ticket-assignee'),
    # path('<int:ticket_id>/assignees/update/', UpdateTicketAssigneeView.as_view(), name='update-ticket-assignee'),


    # --- REPORTS ---
    path("supervisor/reports/tickets/", TicketReportView.as_view(),name="supervisor-ticket-reports",),
    path("supervisor/reports/sla/",SLAReportView.as_view(),name="supervisor-sla-report",),
    path("supervisor/reports/export/",SupervisorReportsExcelExportView.as_view(),name="supervisor-reports-excel-export",),
]