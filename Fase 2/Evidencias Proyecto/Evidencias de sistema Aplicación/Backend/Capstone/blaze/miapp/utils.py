from django.core.mail import send_mail
from django.conf import settings
from .models import Proceso
from .models import Notificacion


def enviar_correo_confirmacion(dueño_email, nombre_dueño, detalles_proceso):
    asunto = 'Confirmación de Proceso'
    mensaje = f"""
    Hola {nombre_dueño},

    Nos complace informarte que tu proceso ha sido confirmado exitosamente.

    Detalles del proceso:
    {detalles_proceso}

    Gracias por confiar en nosotros.

    Saludos,
    Nombre empresa
    """
    remitente = settings.EMAIL_HOST_USER
    destinatario = [dueño_email]

    send_mail(asunto, mensaje, remitente, destinatario, fail_silently=False)


def confirmar_proceso(proceso):
    proceso.estado_proceso = "confirmado"
    proceso.save()

    notificacion = Notificacion(
        mensaje=f"El proceso {proceso.id} ha sido confirmado.",
        estado='enviada',
        proceso=proceso,
        dispositivo_token=proceso.vehiculo.dueño.user.token_dispositivo,
    )
    notificacion.save()

    dueño = proceso.vehiculo.dueño
    enviar_correo_confirmacion(dueño.email, dueño.nombre, f"ID del proceso: {
                               proceso.id}, Descripción: {proceso.descripcion}")
