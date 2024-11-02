from fcm_django.api.rest_framework import FCMError
from fcm_django.models import FCMDevice
from django.core.mail import send_mail
from django.conf import settings


def enviar_notificacion(mensaje, dispositivo_token):
    try:
        device = FCMDevice.objects.get(registration_id=dispositivo_token)
        device.send_message(title="Notificación", body=mensaje)
    except FCMError as e:
        print(f"Error enviando notificación: {e}")


def enviar_correo(destinatario, mensaje):
    subject = "Notificación de Proceso Completado"
    send_mail(
        subject,
        mensaje,
        settings.EMAIL_HOST_USER,
        [destinatario],
        fail_silently=False,
    )
    try:
        enviar_correo(destinatario, mensaje)
    except Exception as e:
        print(f"Error al enviar correo: {e}")
