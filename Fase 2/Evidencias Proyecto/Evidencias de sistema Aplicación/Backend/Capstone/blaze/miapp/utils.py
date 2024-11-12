from pyfcm import FCMNotification
from django.core.mail import send_mail
from django.conf import settings
from .models import Proceso, Notificacion
import logging

logger = logging.getLogger(__name__)

# Configura la conexión con Firebase utilizando la Server Key
push_service = FCMNotification(
    api_key=settings.AIzaSyAW7rGZXp6Vzn6NaYGlTx9WQEDZaCzbSL8)


def enviar_correo(dueño_email, asunto, mensaje):
    """Envía un correo al dueño con el estado del proceso"""
    remitente = settings.EMAIL_HOST_USER
    destinatario = [dueño_email]
    send_mail(asunto, mensaje, remitente, destinatario, fail_silently=False)


def enviar_notificacion_push(token, mensaje):
    """Envía una notificación push al dispositivo usando Firebase"""
    try:
        result = push_service.notify_single_device(
            registration_id=token, message_body=mensaje)
        logger.info(f"Notificación enviada a {token}: {result}")
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
