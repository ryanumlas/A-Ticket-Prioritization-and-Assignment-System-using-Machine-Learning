from django.shortcuts import render
from google.api_core.exceptions import ResourceExhausted
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from tickets.models import Ticket
from .services import analyze_ticket

class TestAIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id):
        try:
            ticket = Ticket.objects.get(id=ticket_id)
        except Ticket.DoesNotExist:
            return Response(
                {'error': 'Ticket not found'},
                status=404
            )

        try:
            result = analyze_ticket(ticket)
        except ResourceExhausted:
            return Response(
                {'error': 'AI service is temporarily unavailable due to quota limits. Please try again later.'},
                status=503
            )
        return Response({'result': result})