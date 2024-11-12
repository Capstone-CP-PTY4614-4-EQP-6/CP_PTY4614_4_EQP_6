import firebase_admin
from firebase_admin import auth, credentials, db
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from django.shortcuts import render, redirect
import logging
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from datetime import datetime

# Inicializar Firebase si no lo está
if not firebase_admin._apps:
    cred = credentials.Certificate('secrets/firebase-admin-credentials.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://blaze-da784-default-rtdb.firebaseio.com'
    })

logger = logging.getLogger(__name__)


def reset_password(request):
    if request.method == "POST":
        email = request.POST.get("email")

        try:
            # Validar formato del email
            validate_email(email)

            # Configurar ActionCodeSettings con una URL de continuación local
            action_code_settings = auth.ActionCodeSettings(
                url="http://localhost:8000/reset-password-complete/",  # Cambia a producción
                handle_code_in_app=True
            )

            # Generar enlace de restablecimiento de contraseña
            reset_link = auth.generate_password_reset_link(
                email, action_code_settings)

            # Guardar evento en Firebase Realtime Database
            guardar_evento_restablecimiento(email)

            # Enviar correo electrónico con el enlace de restablecimiento
            send_mail(
                subject="Restablecimiento de Contraseña",
                message=f"Para restablecer tu contraseña, haz clic en el siguiente enlace: {
                    reset_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            messages.success(
                request, "Se ha enviado un correo para restablecer la contraseña.")
            return redirect("login")
        except ValidationError:
            messages.error(
                request, "Por favor, introduce una dirección de correo electrónico válida.")
        except Exception as e:
            logger.error(f'Error enviando el enlace de restablecimiento: {e}')
            messages.error(
                request, 'Hubo un problema al enviar el correo de restablecimiento. Por favor, intenta nuevamente.')

    return render(request, "reset_password.html")


def guardar_evento_restablecimiento(email):
    ref = db.reference('eventos_restablecimiento')
    ref.push({
        'email': email,
        'fecha_solicitud': str(datetime.now()),
        'estado': 'pendiente',
    })
