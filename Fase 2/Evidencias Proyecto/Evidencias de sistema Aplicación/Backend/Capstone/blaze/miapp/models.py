from django.db import models
from django.contrib.auth.models import User, Group, AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from django.conf import settings
from django.core.validators import RegexValidator
from datetime import datetime
from django.db.models import Sum
from fcm_django.models import FCMDevice


import re


# Usuarios


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('Error en el email'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    is_superadmin = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    email = models.EmailField(unique=True)
    nombre = models.CharField(max_length=30)
    apellido = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    def __str__(self):
        return self.email

    def has_module_perms(self, app_label):
        return True


# Perfiles de ingreso

class Perfil(models.Model):
    USER_ROLES = (
        ('dueño', 'Dueño'),
        ('administrador', 'Administrador'),
        ('trabajador', 'Trabajador'),
        ('supervisor', 'Supervisor'),
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rol = models.CharField(
        max_length=20, choices=USER_ROLES, default='dueño')

    def __str__(self):
        return f"{self.user.email} - {self.rol}"


# Asignacion de grupos segun rol

@receiver(post_save, sender=Perfil)
def asignar_grupo_por_rol(usuario, rol):
    # Obtener todos los grupos necesarios de una sola vez
    grupos = Group.objects.filter(
        name__in=['Administradores', 'Trabajadores', 'Supervisores', 'Dueños'])

    # Verificar si los grupos existen, si no se crean
    grupos_existentes = {grupo.name: grupo for grupo in grupos}
    nombres_grupos = ['Administradores',
                      'Trabajadores', 'Supervisores', 'Dueños']

    for nombre_grupo in nombres_grupos:
        if nombre_grupo not in grupos_existentes:
            grupo = Group.objects.create(name=nombre_grupo)
            grupos_existentes[nombre_grupo] = grupo

    # Asignar el grupo correspondiente según el rol
    grupo_asignado = None
    if rol == 'Administrador':
        grupo_asignado = grupos_existentes['Administradores']
    elif rol == 'Trabajador':
        grupo_asignado = grupos_existentes['Trabajadores']
    elif rol == 'Supervisor':
        grupo_asignado = grupos_existentes['Supervisores']
    elif rol == 'Dueño':
        grupo_asignado = grupos_existentes['Dueños']
    else:
        raise ValueError("Rol no reconocido")

    # Agregar el grupo al usuario
    usuario.groups.add(grupo_asignado)
    usuario.save()


# Crear el perfil

@receiver(post_save, sender=CustomUser)
def manejar_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        # Si el usuario fue creado, se crea el perfil asociado
        Perfil.objects.get_or_create(user=instance)
        print("Perfil creado para el nuevo usuario.")
    else:
        try:
            # Si el usuario ya existe, solo se asegura que el perfil esté actualizado
            perfil = Perfil.objects.get(user=instance)
            print("El perfil ya existe y está actualizado.")
        except Perfil.DoesNotExist:
            # Si el perfil no existe, se crea
            perfil = Perfil(user=instance)
            perfil.save()
            print("Perfil creado para el usuario existente.")


class Dueño(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    rut_validator = RegexValidator(
        regex=r'^\d{7,8}-[0-9kK]{1}$',
        message="El RUT debe tener el formato 12345678-9."
    )

    rut = models.CharField(max_length=10, unique=True,
                           validators=[rut_validator])
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.TextField()
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE, related_name='dueño', null=True)
    rol = models.CharField(max_length=50, default='Dueño', blank=False)

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.rut}) - {self.rol}"


class Vehiculo(models.Model):
    patente = models.CharField(max_length=10, unique=True)

    def clean(self):
        # Validacion para año
        if self.año < 1886 or self.año > datetime.now().year:
            raise ValidationError(_('Año inválido para el vehículo.'))
        self.validar_ano()

    def validar_ano(self):
        current_year = datetime.datetime.now().year
        if self.year > current_year:
            raise ValidationError(
                {'year': 'El año del vehículo no puede ser mayor al año actual.'})

        # Verificar que el año esté dentro de un rango razonable
        if self.year < current_year - 100:
            raise ValidationError(
                {'year': 'El año del vehículo debe estar dentro de un rango razonable de tiempo.'})

    def clean(self):
        super().clean()
        # Validar la patente
        patente_regex = r'^[A-Z]{2}-\d{4}$|^\d{4}-[A-Z]{2}$'
        if not re.match(patente_regex, self.patente):
            raise ValidationError(
                {'patente': 'Formato de patente inválido. Debe ser XX-1234 o 1234-XX.'})

        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super(Vehiculo, self).save(*args, **kwargs)

    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    año = models.IntegerField()
    color = models.CharField(max_length=50)
    kilometraje = models.IntegerField()
    tipo_combustible = models.CharField(max_length=50, choices=[
        ('bencina', 'Bencina'),
        ('diesel', 'Diésel'),
        ('electrico', 'Electrico'),
        ('etanol', 'Etanol'),
        ('gas', 'Gas'),
        ('hibrido', 'Híbrido'),
        ('hidrogeno', 'Hidrógeno'),
        ('otros', 'Otros'),
    ])
    fecha_ultima_revision = models.DateField()
    estado_vehiculo = models.CharField(max_length=100, choices=[
        ('disponible', 'Disponible'),
        ('en_reparacion', 'En Reparación'),
        ('no_disponible', 'No Disponible'),
    ])
    dueño = models.ForeignKey(
        Dueño, on_delete=models.CASCADE, related_name='vehiculos')

    class Meta:
        unique_together = ('patente', 'dueño')

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.patente}) - Estado: {self.estado_vehiculo}"


class Servicio(models.Model):
    SERVICIO_OPCIONES = [
        ('Mantenimiento Preventivo', 'Mantenimiento Preventivo'),
        ('Cambio de Aceite', 'Cambio de Aceite'),
        ('Revisión de Frenos', 'Revisión de Frenos'),
        ('Alineación y Balanceo', 'Alineación y Balanceo'),
        ('Reparación de Motor', 'Reparación de Motor'),
        ('Diagnóstico Eléctrico', 'Diagnóstico Eléctrico'),
    ]

    DURACION_OPCIONES = [
        (30, '30 minutos'),
        (60, '1 hora'),
        (90, '1 hora y 30 minutos'),
        (120, '2 horas'),
    ]

    GARANTIA_OPCIONES = [
        ('1 mes', '1 mes'),
        ('3 meses', '3 meses'),
        ('6 meses', '6 meses'),
        ('1 año', '1 año'),
    ]

    id_servicio = models.AutoField(primary_key=True)
    nombre_servicio = models.CharField(
        max_length=100, choices=SERVICIO_OPCIONES)
    descripcion = models.TextField()
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    duracion_estimada = models.IntegerField(choices=DURACION_OPCIONES)
    garantia = models.CharField(max_length=50, choices=GARANTIA_OPCIONES)

    def __str__(self):
        return self.nombre_servicio


class Administrador(models.Model):
    rut = models.CharField(max_length=12, primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=15)
    email = models.EmailField()
    direccion = models.TextField()
    DISPONIBILIDAD_OPCIONES = [
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),
        ('en_vacaciones', 'En Vacaciones'),
    ]
    ESTADO_OPCIONES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('suspendido', 'Suspendido'),
    ]
    ASIGNACION_OPCIONES = [
        ('jefe_taller', 'Jefe de Taller'),
    ]
    disponibilidad = models.CharField(
        max_length=50, choices=DISPONIBILIDAD_OPCIONES)
    estado = models.CharField(max_length=20, choices=ESTADO_OPCIONES)
    asignacion = models.CharField(max_length=50, choices=ASIGNACION_OPCIONES)
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE, related_name='administrador')
    rol = models.CharField(max_length=50, default='Administrador', blank=False)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.rol}"


class Supervisor(models.Model):
    rut = models.CharField(max_length=12, primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=15)
    email = models.EmailField()
    direccion = models.TextField()
    DISPONIBILIDAD_OPCIONES = [
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),
        ('en_vacaciones', 'En Vacaciones'),
    ]
    ESTADO_OPCIONES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('suspendido', 'Suspendido'),
    ]
    ASIGNACION_OPCIONES = [
        ('supervisor', 'Supervisor'),
    ]
    disponibilidad = models.CharField(
        max_length=50, choices=DISPONIBILIDAD_OPCIONES)
    estado = models.CharField(max_length=20, choices=ESTADO_OPCIONES)
    asignacion = models.CharField(max_length=50, choices=ASIGNACION_OPCIONES)
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE, related_name='supervisor')
    rol = models.CharField(max_length=50, default='Supervisor', blank=False)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.rol}"


class Trabajador(models.Model):
    id_trabajador = models.AutoField(primary_key=True, default=0)
    rut = models.CharField(max_length=12)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=15)
    email = models.EmailField()
    direccion = models.TextField()
    DISPONIBILIDAD_OPCIONES = [
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),
        ('en_vacaciones', 'En Vacaciones'),
    ]
    ESTADO_OPCIONES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('suspendido', 'Suspendido'),
    ]
    ASIGNACION_OPCIONES = [
        ('mecanico', 'Mecánico'),
        ('pintor', 'Pintor'),
        ('electrico', 'Eléctrico'),
    ]
    disponibilidad = models.CharField(
        max_length=50, choices=DISPONIBILIDAD_OPCIONES)
    estado = models.CharField(max_length=20, choices=ESTADO_OPCIONES)
    asignacion = models.CharField(max_length=50, choices=ASIGNACION_OPCIONES)
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE, related_name='trabajador')
    rol = models.CharField(max_length=50, default='Trabajador', blank=False)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.rol}"


class Notificacion(models.Model):
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)

    ESTADO_OPCIONES = [
        ('enviada', 'Enviada'),
        ('pendiente', 'Pendiente'),
        ('vista', 'Vista'),
        ('cancelada', 'Cancelada'),
    ]

    estado = models.CharField(max_length=50, choices=ESTADO_OPCIONES)
    proceso = models.ForeignKey(
        'Proceso', on_delete=models.CASCADE, related_name='notificaciones_proceso')
    dispositivo_token = models.CharField(
        max_length=255, default='', null=False)

    def __str__(self):
        return f"Notificación {self.id} - Estado: {self.estado} - {self.fecha_envio.strftime('%Y-%m-%d %H:%M')}"


class Proceso(models.Model):
    FASE_CHOICES = [
        ('iniciado', 'Iniciado'),
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('en_espera', 'En Espera'),
        ('cancelado', 'Cancelado'),
    ]
    fase_proceso = models.CharField(max_length=100, choices=FASE_CHOICES)
    descripcion = models.TextField()
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField(null=True, blank=True)

    ESTADO_PROCESO_OPCIONES = [
        ('iniciado', 'Iniciado'),
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('pendiente', 'Pendiente'),
    ]

    PRIORIDAD_OPCIONES = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    ]
    estado_proceso = models.CharField(
        max_length=100, choices=ESTADO_PROCESO_OPCIONES)
    prioridad = models.CharField(max_length=50, choices=PRIORIDAD_OPCIONES)
    comentarios = models.TextField(null=True, blank=True)
    trabajador = models.ForeignKey(
        'Trabajador', on_delete=models.CASCADE)
    vehiculo = models.ForeignKey(
        'Vehiculo', on_delete=models.CASCADE, default=1)
    notificaciones = models.ManyToManyField(
        Notificacion, related_name='procesos', blank=True)

    def __str__(self):
        return f"{self.fase_proceso} - {self.estado_proceso}"


class Pago(models.Model):
    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta de Crédito'),
        ('transferencia', 'Transferencia Bancaria'),
    ]

    ESTADO_PAGO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    id_pago = models.AutoField(primary_key=True)
    monto = models.IntegerField()
    metodo_pago = models.CharField(max_length=50, choices=METODO_PAGO_CHOICES)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    estado_pago = models.CharField(max_length=100, choices=ESTADO_PAGO_CHOICES)
    proceso = models.ForeignKey('Proceso', on_delete=models.CASCADE)
    cotizacion = models.ForeignKey(
        'Cotizacion', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Pago {self.id} - {self.estado_pago} - {self.fecha_pago.strftime('%Y-%m-%d')}"


class Cita(models.Model):
    fecha_y_hora = models.DateTimeField()
    motivo = models.TextField()
    ESTADO_CITA_OPCIONES = [
        ('confirmada', 'Confirmada'),
        ('pendiente', 'Pendiente'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
    ]
    estado_cita = models.CharField(
        max_length=100, choices=ESTADO_CITA_OPCIONES, default='pendiente')
    ubicacion = models.CharField(max_length=200)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Cita {self.id} - {self.estado_cita} - {self.fecha_y_hora.strftime('%Y-%m-%d %H:%M')}"


class Cotizacion(models.Model):
    ESTADO_CHOICES = (
        ('Pendiente', 'Pendiente'),
        ('Aceptada', 'Aceptada'),
        ('Rechazada', 'Rechazada'),
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    estado = models.CharField(
        max_length=10, choices=ESTADO_CHOICES, default='Pendiente')
    total_estimado = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00)
    descripcion = models.TextField(blank=True, null=True)
    monto_total = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Cotización {self.id} - {self.estado}"

    def calcular_total_estimado(self):
        # Sumar los costos de todos los detalles de la cotización
        total = self.detallecotizacion_set.aggregate(
            Sum('costo'))['costo__sum'] or 0.00
        self.total_estimado = total
        self.save()


class DetalleCotizacion(models.Model):
    cotizacion = models.ForeignKey(
        Cotizacion, on_delete=models.CASCADE, related_name='detalles')
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    costo_servicio = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cotizacion} - {self.servicio.nombre_servicio}"


@receiver(post_save, sender=DetalleCotizacion)
def actualizar_total_estimado(sender, instance, **kwargs):
    instance.cotizacion.calcular_total_estimado()


@receiver(post_delete, sender=DetalleCotizacion)
def actualizar_total_estimado_on_delete(sender, instance, **kwargs):
    instance.cotizacion.calcular_total_estimado()
