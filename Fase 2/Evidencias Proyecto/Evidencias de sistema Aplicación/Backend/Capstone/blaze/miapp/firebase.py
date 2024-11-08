import firebase_admin
from firebase_admin import auth
from firebase_admin import credentials
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from django.shortcuts import render, redirect
import logging

if not firebase_admin._apps:
    cred = credentials.Certificate('secrets/firebase-admin-credentials.json')
    firebase_admin.initialize_app(cred)

logger = logging.getLogger(__name__)

def reset_password(request):
    if request.method == "POST":
        email = request.POST.get("email")
        try:
            # Configurar ActionCodeSettings con una URL de continuación local
            settings = auth.ActionCodeSettings(
                url="http://localhost:8000/continue/",  # URL de continuación local
                handle_code_in_app=True  # Manejar el código en la app
            )

            # Generar enlace de restablecimiento de contraseña
            reset_link = auth.generate_password_reset_link(email, settings)
            
            # Enviar correo electrónico con el enlace de restablecimiento
            send_mail(
                subject="Restablecimiento de Contraseña",
                message=f"Para restablecer tu contraseña, haz clic en el siguiente enlace: {reset_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            messages.success(
                request, "Se ha enviado un correo para restablecer la contraseña.")
            return redirect("login")
        except Exception as e:
            logger.error(f'Error enviando el enlace de restablecimiento: {e}')
            messages.error(request, f'Error enviando el enlace de restablecimiento: {str(e)}')

    return render(request, "reset_password.html")



