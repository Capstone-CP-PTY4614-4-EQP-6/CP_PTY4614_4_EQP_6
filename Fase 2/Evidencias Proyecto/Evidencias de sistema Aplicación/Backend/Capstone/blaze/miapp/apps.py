from django.apps import AppConfig
from django.db.models.signals import post_migrate


class MiappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'miapp'
    verbose_name = "Gestión de Talleres Automotrices"

    def ready(self):
        from .signals import create_groups
        post_migrate.connect(create_groups, sender=self)


def create_groups(sender, **kwargs):
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType
    from miapp.models import CustomUser, Perfil, Dueño, Vehiculo, Servicio, Administrador, Supervisor, Trabajador, Notificacion, Proceso, Pago, Cita, Cotizacion, DetalleCotizacion

    groups = {
        'Dueños': {'models': [Vehiculo, Proceso, Cotizacion, Cita, Pago], 'actions': ['view', 'add']},
        'Administradores': {'models': [Trabajador, Dueño, Proceso, Pago, Cotizacion, Cita], 'actions': ['view', 'add', 'change', 'delete']},
        'Trabajadores': {'models': [Proceso], 'actions': ['view', 'add']},
        'Supervisores': {'models': [Proceso], 'actions': ['view', 'change']},
    }

    for group_name, permissions_data in groups.items():
        group, created = Group.objects.get_or_create(name=group_name)
        for model in permissions_data['models']:
            content_type = ContentType.objects.get_for_model(model)
            for action in permissions_data['actions']:
                permission, _ = Permission.objects.get_or_create(
                    codename=f'{action}_{model._meta.model_name}',
                    content_type=content_type,
                    name=f'Can {action} {model._meta.model_name}'
                )
                group.permissions.add(permission)
