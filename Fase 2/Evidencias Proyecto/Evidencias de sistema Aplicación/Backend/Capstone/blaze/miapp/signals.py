from django.db.models.signals import post_migrate, post_save, post_delete
from django.contrib.auth.models import Group, Permission
from django.dispatch import receiver
from .models import DetalleCotizacion

@receiver([post_save, post_delete], sender=DetalleCotizacion)
def actualizar_total_estimado(sender, instance, **kwargs):
    instance.cotizacion.calcular_total_estimado()

@receiver(post_migrate)
def create_groups(sender, **kwargs):
    if sender.name == 'miapp':
        groups = [
            {'name': 'Dueños', 'permissions': []},
            {'name': 'Clientes', 'permissions': []},
            {'name': 'Administradores', 'permissions': Permission.objects.all()},
            {'name': 'Trabajadores', 'permissions': Permission.objects.filter(
                codename__startswith='view_proceso') | Permission.objects.filter(codename__startswith='add_proceso')},
            {'name': 'Supervisores', 'permissions': Permission.objects.filter(
                codename__startswith='view_proceso') | Permission.objects.filter(codename__startswith='change_proceso')}
        ]

        for group_info in groups:
            group, created = Group.objects.update_or_create(
                name=group_info['name'])
            print(f"Grupo '{group_info['name']}' {'creado' if created else 'actualizado'}")
            if created or not group.permissions.exists():
                group.permissions.set(group_info['permissions'])
                print(f"Permisos asignados a '{group_info['name']}'")
