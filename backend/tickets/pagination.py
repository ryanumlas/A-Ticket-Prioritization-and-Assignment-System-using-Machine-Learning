from rest_framework.pagination import PageNumberPagination
from django.core.paginator import InvalidPage
from rest_framework.exceptions import NotFound

class TicketPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 100


class WorkloadPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = "page_size"
    max_page_size = 20

    def paginate_queryset(self, queryset, request, view=None):
        page_size = self.get_page_size(request)

        if not page_size:
            return list(queryset)

        paginator = self.django_paginator_class(
            queryset,
            page_size,
        )

        self.request = request
        self.workload_paginator = paginator

        page_number = request.query_params.get(
            self.page_query_param,
            1,
        )

        try:
            self.page = paginator.page(page_number)
        except InvalidPage:
            self.page = None
            self.workload_page_number = int(page_number)
            return []

        self.workload_page_number = self.page.number

        return list(self.page)