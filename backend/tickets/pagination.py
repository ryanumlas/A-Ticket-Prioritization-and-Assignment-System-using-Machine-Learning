from rest_framework.pagination import PageNumberPagination


class TicketPagination(PageNumberPagination):
    page_size = 15