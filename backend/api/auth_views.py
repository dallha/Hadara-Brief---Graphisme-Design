from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.cache import cache

# Single-Admin Authentication using Django's TimestampSigner.
# Expiration is set to 2 hours (7200 seconds).

signer = TimestampSigner()
MAX_ATTEMPTS = 5
LOCKOUT_TIME = 900  # 15 minutes in seconds

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class AdminLoginView(APIView):
    def post(self, request):
        ip = get_client_ip(request)
        cache_key = f'admin_login_attempts_{ip}'
        attempts = cache.get(cache_key, 0)
        
        if attempts >= MAX_ATTEMPTS:
            return Response(
                {"error": "Trop de tentatives. Veuillez réessayer plus tard."}, 
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")
        
        # Credentials must be set via environment variables — no hardcoded fallbacks
        admin_username = os.getenv("ADMIN_USERNAME")
        admin_password = os.getenv("ADMIN_PASSWORD")

        if not admin_password:
            return Response(
                {"error": "Server misconfiguration: ADMIN_PASSWORD environment variable is not set."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Accept either the exact env username or a generic 'admin' username for flexibility
        is_valid_user = (
            (admin_username and username.lower() == admin_username.lower())
            or username.lower() == "admin"
        )

        if is_valid_user and password == admin_password:
            # Generate a signed token containing the admin identity
            cache.delete(cache_key)
            token = signer.sign("admin_user")
            return Response({"token": token, "message": "Connexion réussie"}, status=status.HTTP_200_OK)
        else:
            cache.set(cache_key, attempts + 1, LOCKOUT_TIME)
            return Response({"error": "Identifiants incorrects"}, status=status.HTTP_401_UNAUTHORIZED)

class AdminVerifyView(APIView):
    def get(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return Response({"error": "Jeton manquant"}, status=status.HTTP_401_UNAUTHORIZED)
            
        token = auth_header.split(" ")[1]
        
        try:
            # Verify the token with a max_age of 2 hours
            value = signer.unsign(token, max_age=7200)
            if value == "admin_user":
                return Response({"message": "Jeton valide"}, status=status.HTTP_200_OK)
        except SignatureExpired:
            return Response({"error": "Jeton expiré"}, status=status.HTTP_401_UNAUTHORIZED)
        except BadSignature:
            return Response({"error": "Jeton invalide"}, status=status.HTTP_401_UNAUTHORIZED)
            
        return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)

# Utility function to check token in other views
def verify_admin_token(request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return False
        
    token = auth_header.split(" ")[1]
    try:
        value = signer.unsign(token, max_age=7200)
        return value == "admin_user"
    except (BadSignature, SignatureExpired):
        return False

class ClientLoginView(APIView):
    def post(self, request):
        ip = get_client_ip(request)
        cache_key = f'client_login_attempts_{ip}'
        attempts = cache.get(cache_key, 0)
        
        if attempts >= MAX_ATTEMPTS:
            return Response(
                {"error": "Trop de tentatives. Veuillez réessayer plus tard."}, 
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        whatsapp = request.data.get("whatsapp", "").strip()
        if not whatsapp:
            return Response({"error": "Numéro WhatsApp requis"}, status=status.HTTP_400_BAD_REQUEST)
            
        # We just sign the whatsapp number as the identity
        cache.delete(cache_key)
        token = signer.sign(f"client_{whatsapp}")
        return Response({"token": token, "message": "Connexion réussie", "whatsapp": whatsapp}, status=status.HTTP_200_OK)

def verify_client_token(request):
    """Returns the whatsapp number if valid, False otherwise"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return False
        
    token = auth_header.split(" ")[1]
    try:
        # Client tokens valid for 30 days
        value = signer.unsign(token, max_age=2592000)
        if value.startswith("client_"):
            return value.split("client_")[1]
        return False
    except (BadSignature, SignatureExpired):
        return False
