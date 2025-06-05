from time import localtime

from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

class AccountOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile  # assuming OneToOne exists

        return Response({
            "email": user.email,
            "username": user.username,
            "company": profile.company,
            "credits": float(profile.credits),
            "two_factor_enabled": profile.two_factor_enabled,
            "last_login": localtime(user.last_login).isoformat() if user.last_login else None,
            "timezone": profile.timezone if hasattr(profile, "timezone") else "UTC",
            "openstack_user_id": profile.openstack_user_id,
            "phone_number": profile.phone_number,
        })