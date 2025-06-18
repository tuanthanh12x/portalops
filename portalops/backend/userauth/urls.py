from django.urls import path

from .serializers import CreateUserSerializer
from .views import LoginView, SignUpView, RefreshTokenView, LogoutView, UserInfoView, ResetPasswordConfirmView, \
    ChangePasswordView, ForgotPasswordView, Verify2FASetupView, Generate2FAView, \
    UserProfileInfoView, UpdateUserProfileView, TWOFALoginView, CreateUserAPIView, RoleListAPIView, UserListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),

    path('2fa/verify/', Verify2FASetupView.as_view(), name=''),
    path('2fa/generate/', Generate2FAView.as_view(), name='2fa-generate'),
    path('2fa/enable/', Verify2FASetupView.as_view(), name='2fa-verify-enable'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordConfirmView.as_view(), name="reset-password-confirm"),
    path('userinfo/', UserInfoView.as_view(), name='userinfo'),
    path('profile/info/', UserProfileInfoView.as_view(), name='userinfo'),
    path('profile/update/', UpdateUserProfileView.as_view()),
    path("token/refresh/", RefreshTokenView.as_view(), name="token-refresh"),
    path('two-fa-login/', TWOFALoginView.as_view(), name='2falog'),




    #admin
    path('create-user/', CreateUserAPIView.as_view(), name='create-user'),
    path('roles-list/', RoleListAPIView.as_view(), name='role-list'),
    path("users-list/", UserListView.as_view(), name="user-list"),

]
