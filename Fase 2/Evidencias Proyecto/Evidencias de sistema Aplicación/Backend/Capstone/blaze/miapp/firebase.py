from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from django.shortcuts import render, redirect
from django.utils.crypto import get_random_string
from django.utils.timezone import now
from .models import PasswordResetToken
import firebase_admin
from firebase_admin import credentials
from django.utils import timezone
from firebase_admin import firestore
from django.contrib.auth.models import User
from miapp.models import CustomUser


if not firebase_admin._apps:
    cred = credentials.Certificate('secrets/firebase-admin-credentials.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()


def reset_password(request, token):
    try:
        # Verificar si el token existe y ha expirado
        reset_token = PasswordResetToken.objects.get(token=token)

        if reset_token.expiration_time < timezone.now():
            messages.error(
                request, "El enlace de restablecimiento ha expirado.")
            return redirect("login")

        if request.method == "POST":
            # Procesar el nuevo password
            new_password = request.POST.get("new_password")
            # Aquí podrías actualizar la contraseña del usuario
            user = reset_token.user
            user.set_password(new_password)
            user.save()

            messages.success(request, "Contraseña restablecida correctamente.")
            return redirect("login")

        return render(request, "reset_password.html")

    except PasswordResetToken.DoesNotExist:
        messages.error(request, "Token de restablecimiento no válido.")
        return redirect("login")
