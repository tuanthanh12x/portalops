from django.utils.timezone import localtime

from django.shortcuts import render
from django.utils.timezone import is_naive, make_aware
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

class AccountOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile  # assuming OneToOne exists
        last_login = user.last_login
        if last_login:
            if is_naive(last_login):
                last_login = make_aware(last_login)
            last_login = localtime(last_login).isoformat()
        else:
            last_login = None
        return Response({
            "email": user.email,
            "username": user.username,
            "company": profile.company,
            "credits": float(profile.credits),
            "two_factor_enabled": profile.two_factor_enabled,
            "last_login": last_login,
            "timezone": profile.timezone if hasattr(profile, "timezone") else "UTC",
            "openstack_user_id": profile.openstack_user_id,
            "phone_number": profile.phone_number,
        })


class ListUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile  # assuming OneToOne exists
        last_login = user.last_login
        if last_login:
            if is_naive(last_login):
                last_login = make_aware(last_login)
            last_login = localtime(last_login).isoformat()
        else:
            last_login = None
        return Response({
            "email": user.email,
            "username": user.username,
            "company": profile.company,
            "credits": float(profile.credits),
            "two_factor_enabled": profile.two_factor_enabled,
            "last_login": last_login,
            "timezone": profile.timezone if hasattr(profile, "timezone") else "UTC",
            "openstack_user_id": profile.openstack_user_id,
            "phone_number": profile.phone_number,
        })