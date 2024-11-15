from django.core.mail import send_mail
from django.conf import settings
from .models import Proceso, Notificacion
import logging
from google.oauth2 import service_account
import google.auth.transport.requests
import requests
import json


logger = logging.getLogger(__name__)

# Carga las credenciales de la cuenta de servicio
credentials = service_account.Credentials.from_service_account_file(
    'secrets/firebase-admin-credentials.json',
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)


def obtener_token_acceso():
    """Obtiene el token de acceso de OAuth 2.0 para Firebase"""
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)
    return credentials.token


def enviar_correo(dueño_email, asunto, mensaje):
    """Envía un correo al dueño con el estado del proceso"""
    remitente = settings.EMAIL_HOST_USER
    destinatario = [dueño_email]
    send_mail(asunto, mensaje, remitente, destinatario, fail_silently=False)


def enviar_notificacion_push(token, mensaje):
    """Envía una notificación push al dispositivo usando la API HTTP v1 de Firebase"""
    access_token = obtener_token_acceso()
    url = "https://fcm.googleapis.com/v1/projects/tu-proyecto-id/messages:send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    body = {
        "message": {
            "token": token,
            "notification": {
                "title": "Actualización de proceso",
                "body": mensaje
            }
        }
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(body))
        if response.status_code == 200:
            logger.info(f"Notificación enviada a {token}: {response.json()}")
        else:
            logger.error(f"Error enviando notificación: {response.content}")
    except Exception as e:
        logger.error(f"Error enviando notificación: {e}")
        raise


def actualizar_estado_proceso(proceso, nuevo_estado):
    """Actualiza el estado del proceso y envía las notificaciones correspondientes"""
    proceso.estado_proceso = nuevo_estado
    proceso.save()

    mensaje = f"El proceso {
        proceso.id} ha cambiado de estado a '{nuevo_estado}'."

    # Crear la notificación en la base de datos
    notificacion = Notificacion(
        mensaje=mensaje,
        estado='enviada',
        proceso=proceso,
        dispositivo_token=proceso.vehiculo.dueño.user.token_dispositivo,  # Token de dispositivo
    )
    notificacion.save()

    # Enviar notificación push si el token está disponible
    token_dispositivo = notificacion.dispositivo_token
    if token_dispositivo:
        enviar_notificacion_push(token_dispositivo, mensaje)

    # Enviar correo electrónico al dueño del vehículo
    dueño = proceso.vehiculo.dueño
    asunto = f"Estado actualizado del proceso {proceso.id}"
    mensaje_correo = f"""
    Estimado {dueño.nombre},

    El estado de tu proceso ha cambiado a: {nuevo_estado}.

    Detalles:
    ID del proceso: {proceso.id}
    Descripción: {proceso.descripcion}
    """
    enviar_correo(dueño.email, asunto, mensaje_correo)
