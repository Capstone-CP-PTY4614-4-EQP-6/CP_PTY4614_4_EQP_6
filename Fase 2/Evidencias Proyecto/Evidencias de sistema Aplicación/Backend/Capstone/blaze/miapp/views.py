# Importaciones de Django
from .models import Perfil, Dueño, Vehiculo, Proceso, Pago, Cita, Cotizacion
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import login, authenticate, get_user_model
from django.contrib.auth.models import User, Group
from django.contrib import messages
from django.urls import reverse
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.mixins import UserPassesTestMixin
from fcm_django.api.rest_framework import FCMDevice
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django import forms
from django.core.mail import send_mail
from firebase_admin import auth
from django.contrib import messages
from django.shortcuts import render
from transbank.webpay.webpay_plus.transaction import Transaction
from django.http import JsonResponse

# Importaciones de la aplicación
from .models import CustomUserManager, CustomUser, Perfil, Dueño, Vehiculo, Servicio, Administrador, Supervisor, Trabajador, Notificacion, Proceso, Pago, Cita, Cotizacion, DetalleCotizacion
from .forms import AdminCreationForm, AdminTrabajadorForm, AdminSupervisorForm, UserRegistrationForm, DueñoForm, VehiculoForm, CitaForm, ServicioForm, PagoForm, ProcesoForm, NotificacionForm, CotizacionForm, DetalleCotizacionForm
from .utils import enviar_correo_confirmacion, confirmar_proceso
from .firebase import reset_password

# Librerias
import pandas as pd
from openpyxl import Workbook


# Administrador


def superadmin_required(view_func):
    decorated_view_func = user_passes_test(
        lambda u: u.is_active and getattr(u, 'is_superadmin', False))(view_func)
    return decorated_view_func


@login_required
@superadmin_required
def create_admin(request):
    if request.method == 'POST':
        form = AdminCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_admin = True
            user.save()
            return redirect('success_page')
    else:
        form = AdminCreationForm()
    return render(request, 'create_admin.html', {'form': form})


# Usuario

CustomUser = get_user_model()

# Notificaciones


@api_view(['POST'])
def registrar_dispositivo(request):
    from fcm_django.api.rest_framework import FCMDevice

    token = request.data.get('token')

    if token:
        device, created = FCMDevice.objects.get_or_create(
            registration_id=token,
            defaults={'name': request.data.get(
                'name', 'Dispositivo sin nombre')}
        )

        if created:
            return Response({"status": "dispositivo registrado"}, status=201)
        else:
            return Response({"status": "dispositivo ya registrado"}, status=200)
    else:
        return Response({"error": "token no proporcionado"}, status=400)


# Perfiles

def perfil_requerido(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request.user, 'perfil'):
            return HttpResponseForbidden('No tienes un perfil asociado')
        return view_func(request, *args, **kwargs)
    return _wrapped_view


@receiver(post_save, sender=User)
def crear_guardar_perfil(sender, instance, created, **kwargs):
    if created:
        perfil = Perfil.objects.create(
            user=instance, rol='Admin' if instance.is_staff else 'Dueño')
        perfil.save()
    else:
        instance.perfil.save()


def es_admin(user):
    return user.is_staff or user.groups.filter(name='Administradores').exists()


# Vista de inicio

def inicio(request):
    is_cliente = request.user.groups.filter(
        name="Clientes").exists() if request.user.is_authenticated else False
    is_dueño = request.user.groups.filter(
        name="Dueños").exists() if request.user.is_authenticated else False
    is_supervisor = request.user.groups.filter(
        name="Supervisores").exists() if request.user.is_authenticated else False
    is_administrador = request.user.groups.filter(
        name="Administradores").exists() if request.user.is_authenticated else False
    is_trabajador = request.user.groups.filter(
        name="Trabajadores").exists() if request.user.is_authenticated else False

    context = {
        'is_cliente': is_cliente,
        'is_dueño': is_dueño,
        'is_supervisor': is_supervisor,
        'is_administrador': is_administrador,
        'is_trabajador': is_trabajador,
    }

    return render(request, 'inicio.html', context)


# Vista del login

def login_view(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Bienvenido {user.nombre}!")

            # Redirección según el rol del usuario
            if user.perfil.rol == 'Administrador':
                return redirect('inicio')
            elif user.perfil.rol == 'Dueño':
                return redirect('inicio')
            elif user.perfil.rol == 'Supervisor':
                return redirect('inicio')
            elif user.perfil.rol == 'Clientes':
                return redirect('inicio')
            elif user.perfil.rol == 'Trabajador':
                return redirect('inicio')
            else:
                return redirect('inicio')
        else:
            messages.error(request, 'Email o contraseña incorrectos')
    return render(request, 'login.html')



# Vista para la creacion de trabajadores (solo accesible por administradores)


@ login_required
@ perfil_requerido
@ user_passes_test(es_admin)
def crear_trabajador(request):
    if request.user.perfil.rol != 'Admin':
        messages.error(
            request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    if request.method == 'POST':
        form = AdminTrabajadorForm(request.POST)
        if form.is_valid():
            trabajador = form.save(commit=False)
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = CustomUser.objects.create_user(
                email=email, password=password)
            trabajador.perfil = Perfil.objects.create(
                user=user, rol='Trabajador')
            trabajador.save()
            messages.success(request, 'Trabajador creado con éxito')
            return redirect('inicio')
    else:
        form = AdminTrabajadorForm()
    return render(request, 'trabajadores/crear_trabajador.html', {'form': form})


# Vista para gestionar los trabajadores (solo accesible por administradores)

@ login_required
@user_passes_test(es_admin)
def lista_trabajadores(request):
    if request.user.perfil.rol != 'Admin':
        messages.error(
            request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    trabajadores = Trabajador.objects.all()
    return render(request, 'trabajadores/lista_trabajadores.html', {'trabajadores': trabajadores})


@login_required
@user_passes_test(es_admin)
def editar_trabajador(request, id_trabajador):
    if request.user.perfil.rol != 'Admin':
        messages.error(
            request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    trabajador = get_object_or_404(Trabajador, id_trabajador=id_trabajador)

    if request.method == 'POST':
        form = AdminTrabajadorForm(request.POST, instance=trabajador)
        if form.is_valid():
            form.save()
            messages.success(request, 'Trabajador editado con éxito')
            return redirect('lista_trabajadores')
    else:
        form = AdminTrabajadorForm(instance=trabajador)

    return render(request, 'trabajadores/editar_trabajador.html', {'form': form})


@login_required
@user_passes_test(es_admin)
def eliminar_trabajador(request, id_trabajador):
    if request.user.perfil.rol != 'Admin':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    trabajador = get_object_or_404(Trabajador, id_trabajador=id_trabajador)

    if request.method == 'POST':
        try:
            trabajador.delete()
            messages.success(request, 'Trabajador eliminado con éxito')
        except Exception as e:
            messages.error(request, f'Error eliminando trabajador: {str(e)}')
        return redirect('lista_trabajadores')

    return render(request, 'trabajadores/eliminar_trabajador.html', {'trabajador': trabajador})


@login_required
@user_passes_test(es_admin)
def bloquear_trabajador(request, trabajador_id):
    trabajador = get_object_or_404(Trabajador, id=trabajador_id)
    trabajador.bloqueado = True
    trabajador.save()
    return redirect('lista_trabajadores')


@login_required
@user_passes_test(es_admin)
def desbloquear_trabajador(request, trabajador_id):
    trabajador = get_object_or_404(Trabajador, id=trabajador_id)
    trabajador.bloqueado = False
    trabajador.save()
    return redirect('lista_trabajadores')

# Vista para gestionar los supervisores (solo accesible por administradores)


@login_required
@user_passes_test(es_admin)
def lista_supervisores(request):
    supervisores = Supervisor.objects.all()
    return render(request, 'lista_supervisores.html', {'supervisores': supervisores})


@login_required
@user_passes_test(es_admin)
def crear_supervisor(request):
    if request.method == 'POST':
        form = AdminSupervisorForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lista_supervisores')
    else:
        form = AdminSupervisorForm()
    return render(request, 'crear_supervisor.html', {'form': form})


@login_required
@user_passes_test(es_admin)
def editar_supervisor(request, supervisor_id):
    supervisor = get_object_or_404(Supervisor, id=supervisor_id)
    if request.method == 'POST':
        form = AdminSupervisorForm(request.POST, instance=supervisor)
        if form.is_valid():
            form.save()
            return redirect('lista_supervisores')
    else:
        form = AdminSupervisorForm(instance=supervisor)
    return render(request, 'editar_supervisor.html', {'form': form, 'supervisor': supervisor})


@login_required
@user_passes_test(es_admin)
def eliminar_supervisor(request, supervisor_id):
    supervisor = get_object_or_404(Supervisor, id=supervisor_id)
    if request.method == 'POST':
        try:
            supervisor.delete()
            messages.success(request, 'Supervisor eliminado con éxito')
        except Exception as e:
            messages.error(request, f'Error eliminando supervisor: {str(e)}')
        return redirect('lista_supervisores')
    return render(request, 'eliminar_supervisor.html', {'supervisor': supervisor})


@login_required
@user_passes_test(es_admin)
def bloquear_supervisor(request, supervisor_id):
    supervisor = get_object_or_404(Supervisor, id=supervisor_id)
    supervisor.bloqueado = True
    supervisor.save()
    return redirect('lista_supervisores')


@login_required
@user_passes_test(es_admin)
def desbloquear_supervisor(request, supervisor_id):
    supervisor = get_object_or_404(Supervisor, id=supervisor_id)
    supervisor.bloqueado = False
    supervisor.save()
    return redirect('lista_supervisores')

# Mi cuenta


@login_required
def mi_cuenta(request):
    user = request.user
    perfil = None
    vehiculos = []
    procesos = []
    pagos = []
    citas = []
    cotizaciones = []

    try:
        perfil = user.perfil
    except Perfil.DoesNotExist:
        perfil = None

    if perfil:
        try:
            dueño = Dueño.objects.get(user=user)
            vehiculos = Vehiculo.objects.filter(dueño=dueño)
            procesos = Proceso.objects.filter(vehiculo__dueño=dueño)
            pagos = Pago.objects.filter(reparacion__vehiculo__dueño=dueño)
            citas = Cita.objects.filter(vehiculo__dueño=dueño)
            cotizaciones = Cotizacion.objects.filter(vehiculo__dueño=dueño)
        except Dueño.DoesNotExist:
            dueño = None
        except Exception as e:
            print(f"Error al obtener el dueño: {e}")

        if perfil.rol == 'trabajador':
            procesos = Proceso.objects.filter(trabajador=perfil)

        elif perfil.rol == 'supervisor':
            procesos = Proceso.objects.filter(supervisor=perfil)

        elif perfil.rol == 'administrador':
            procesos = Proceso.objects.filter(vehiculo__dueño=dueño)
            vehiculos = Vehiculo.objects.filter(dueño=dueño)
            pagos = Pago.objects.filter(reparacion__vehiculo__dueño=dueño)
            citas = Cita.objects.filter(vehiculo__dueño=dueño)
            cotizaciones = Cotizacion.objects.filter(vehiculo__dueño=dueño)

    if not procesos:
        procesos = Proceso.objects.all()

    context = {
        'user': user,
        'perfil': perfil,
        'vehiculos': vehiculos,
        'procesos': procesos,
        'pagos': pagos,
        'citas': citas,
        'cotizaciones': cotizaciones,
    }

    return render(request, 'mi_cuenta.html', context)


def registrar_usuario(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            nombre = form.cleaned_data['nombre']
            apellido = form.cleaned_data['apellido']
            password = form.cleaned_data['password']

            user = CustomUser.objects.create_user(
                email=email,
                password=password
            )

            if not Perfil.objects.filter(user=user).exists():
                perfil = Perfil(user=user, rol='Cliente')
                perfil.save()
            else:
                messages.warning(
                    request, 'El usuario ya tiene un perfil asociado')

            messages.success(request, 'Usuario registrado exitosamente')
            return redirect('inicio')
    else:
        form = UserRegistrationForm()

    return render(request, 'registrar_usuario.html', {'form': form})


# Gestión de Clientes

@ login_required
def lista_dueños(request):
    dueños = Dueño.objects.all()
    return render(request, 'dueños/lista_dueños.html', {'dueños': dueños})


@login_required
def registrar_dueño(request):
    if hasattr(request.user, 'dueño'):
        messages.error(request, 'Este usuario ya está registrado como dueño')
        return redirect('inicio')

    if request.method == 'POST':
        form = DueñoForm(request.POST, user=request.user)
        if form.is_valid():
            nuevo_dueño = form.save(commit=False)
            nuevo_dueño.user = request.user
            nuevo_dueño.save()

            grupo, created = Group.objects.get_or_create(name='dueños')
            request.user.groups.add(grupo)

            perfil, created = Perfil.objects.get_or_create(user=request.user)
            perfil.rol = 'Dueño'
            perfil.save()

            messages.success(request, 'Dueño registrado correctamente.')
            return redirect('inicio')
        else:
            messages.error(
                request, 'Por favor corrige los errores en el formulario')
    else:
        initial_data = {
            'nombre': request.user.nombre,
            'apellido': request.user.apellido,
        }
        form = DueñoForm(initial=initial_data)

    return render(request, 'dueños/registrar_dueño.html', {'form': form})


@login_required
def editar_dueño(request, id):
    dueño = get_object_or_404(Dueño, id=id)
    if request.method == 'POST':
        form = DueñoForm(request.POST, instance=dueño)
        if form.is_valid():
            form.save()
            messages.success(request, 'Dueño actualizado correctamente')
            return redirect('lista_dueños')
    else:
        form = DueñoForm(instance=dueño)
    return render(request, 'dueños/editar_dueño.html', {'form': form, 'dueño': dueño})


@login_required
@user_passes_test(es_admin)
def eliminar_dueño(request, dueño_id):
    dueño = get_object_or_404(Dueño, id=dueño_id)
    if request.method == 'POST':
        try:
            dueño.delete()
            messages.success(request, 'Dueño eliminado correctamente.')
        except Exception as e:
            messages.error(request, f'Error eliminando dueño: {str(e)}')
        return redirect('lista_dueños')
    return render(request, 'dueños/eliminar_dueño.html', {'dueño': dueño})


@login_required
@user_passes_test(es_admin)
def bloquear_dueño(request, dueño_id):
    dueño = get_object_or_404(Dueño, id=dueño_id)
    dueño.bloqueado = True
    dueño.save()
    return redirect('lista_dueños')


@login_required
@user_passes_test(es_admin)
def desbloquear_dueño(request, dueño_id):
    dueño = get_object_or_404(Dueño, id=dueño_id)
    dueño.bloqueado = False
    dueño.save()
    return redirect('lista_dueños')

# Gestión de Vehículos


@login_required
def lista_vehiculos(request):
    try:
        dueño = request.user.dueño
    except ObjectDoesNotExist:
        messages.error(request, "El usuario no tiene un dueño asociado.")
        return redirect('inicio')

    vehiculos = dueño.vehiculos.all()

    vehiculos_procesos = [
        {
            'vehiculo': vehiculo,
            'procesos': Proceso.objects.filter(vehiculo=vehiculo)
        } for vehiculo in vehiculos
    ]

    return render(request, 'vehiculos/lista_vehiculos.html', {
        'vehiculos_procesos': vehiculos_procesos,
        'vehiculos': vehiculos
    })


@ login_required
def registrar_vehiculo(request):
    if not hasattr(request.user, 'dueño'):
        messages.error(request, 'No tienes un perfil de dueño asociado.')
        return redirect('inicio')

    if request.method == 'POST':
        form = VehiculoForm(request.POST)
        if form.is_valid():
            vehiculo = form.save(commit=False)
            vehiculo.dueño = request.user.dueño
            vehiculo.save()
            messages.success(request, 'Vehículo registrado correctamente.')
            return redirect('lista_vehiculos')
        else:
            print(form.errors)
    else:
        form = VehiculoForm()

    return render(request, 'vehiculos/registrar_vehiculo.html', {'form': form})


@ login_required
def editar_vehiculo(request, pk):
    vehiculo = get_object_or_404(Vehiculo, pk=pk)

    if vehiculo.dueño != request.user.dueño:
        messages.error(request, "No tienes permiso para editar este vehículo.")
        return redirect('lista_vehiculos')

    if request.method == 'POST':
        form = VehiculoForm(request.POST, instance=vehiculo)
        if form.is_valid():
            form.save()
            messages.success(request, 'Vehículo actualizado correctamente')
            return redirect('lista_vehiculos')
    else:
        form = VehiculoForm(instance=vehiculo)

    return render(request, 'vehiculos/editar_vehiculo.html', {'form': form, 'vehiculo': vehiculo})


@login_required
def eliminar_vehiculo(request, vehiculo_id):
    vehiculo = get_object_or_404(Vehiculo, id=vehiculo_id)

    if vehiculo.dueño != request.user.dueño:
        messages.error(
            request, "No tienes permiso para eliminar este vehículo")
        return redirect('lista_vehiculos')

    vehiculo.delete()
    messages.success(request, 'Vehículo eliminado correctamente')
    return redirect('lista_vehiculos')


# Gestión de Reparaciones

@ login_required
def lista_procesos(request):
    procesos = Proceso.objects.all()
    return render(request, 'procesos/lista_procesos.html', {'procesos': procesos})


# Registrar proceso asociado a una reparacion

@login_required
@user_passes_test(es_admin)
def registrar_proceso(request):
    if request.method == 'POST':
        proceso_form = ProcesoForm(request.POST)
        notificacion_form = NotificacionForm(request.POST)

        if proceso_form.is_valid() and notificacion_form.is_valid():
            proceso = proceso_form.save()

            notificacion = notificacion_form.save(commit=False)
            notificacion.proceso = proceso
            notificacion.save()

            # Verificar si el proceso esta completado
            if proceso.estado_proceso == 'completado':
                dueño = proceso.vehiculo.dueño
                dueño_email = dueño.email
                nombre_dueño = dueño.nombre
                detalles_proceso = f"ID del proceso: {proceso.id}, Descripción: {proceso.descripcion}"

                # Envia el correo de confirmación
                try:
                    enviar_correo_confirmacion(
                        dueño_email, nombre_dueño, detalles_proceso)
                except Exception as e:
                    print(f"Error al enviar el correo de confirmación: {e}")

            return redirect('inicio')
    else:
        proceso_form = ProcesoForm()
        notificacion_form = NotificacionForm()

    return render(request, 'procesos/registrar_proceso.html', {
        'proceso_form': proceso_form,
        'notificacion_form': notificacion_form,
    })

# Editar proceso de reparacion


@ login_required
@ user_passes_test(es_admin)
def editar_proceso(request, pk):
    proceso = get_object_or_404(Proceso, pk=pk)
    if request.method == 'POST':
        form = ProcesoForm(request.POST, instance=proceso)
        if form.is_valid():
            form.save()
            messages.success(request, 'Proceso actualizado correctamente')
            return redirect('lista_procesos')
    else:
        form = ProcesoForm(instance=proceso)
    return render(request, 'procesos/editar_proceso.html', {'form': form})


# Eliminar proceso

@ login_required
@ user_passes_test(es_admin)
def eliminar_proceso(request, pk):
    proceso = get_object_or_404(Proceso, pk=pk)
    proceso.delete()
    messages.success(request, 'Proceso eliminado correctamente')
    return redirect('lista_procesos')


# Función para permitir solo a supervisores

def es_supervisor(user):
    return user.groups.filter(name='Supervisores').exists()


# Gestión de Citas

@ login_required
def lista_citas(request):
    citas = Cita.objects.all()
    return render(request, 'citas/lista_citas.html', {'citas': citas})


@login_required
def registrar_cita(request):
    user = request.user
    es_supervisor_o_admin = user.is_superuser or user.groups.filter(
        name="Supervisores").exists()

    if request.method == 'POST':
        form = CitaForm(request.POST)
        if form.is_valid():
            cita = form.save(commit=False)
            if not es_supervisor_o_admin:
                cita.estado_cita = 'pendiente'
            cita.save()
            messages.success(request, 'Cita registrada correctamente.')
            return redirect('lista_citas')
        else:
            messages.error(request, 'Hubo un error al registrar la cita.')
            print("Errores del formulario:", form.errors)
    else:
        form = CitaForm()

    if not es_supervisor_o_admin:
        form.fields['estado_cita'].widget = forms.HiddenInput()
        form.fields['estado_cita'].initial = 'pendiente'

    context = {
        'form': form,
        'es_supervisor_o_admin': es_supervisor_o_admin,
    }
    return render(request, 'citas/registrar_cita.html', context)


@ login_required
def editar_cita(request, pk):
    cita = get_object_or_404(Cita, pk=pk)
    if request.method == 'POST':
        form = CitaForm(request.POST, instance=cita)
        if form.is_valid():
            if not request.user.groups.filter(name__in=['Administrador', 'Supervisor']).exists():
                form.cleaned_data['estado_cita'] = cita.estado_cita
            form.save()
            messages.success(request, 'Cita actualizada correctamente.')
            return redirect('lista_citas')
    else:
        form = CitaForm(instance=cita)
        if not request.user.groups.filter(name__in=['Administrador', 'Supervisor']).exists():
            form.fields['estado_cita'].widget = forms.HiddenInput()

    return render(request, 'citas/editar_cita.html', {'form': form, 'cita': cita})


@ login_required
def eliminar_cita(request, pk):
    cita = get_object_or_404(Cita, pk=pk)
    cita.delete()
    messages.success(request, 'Cita eliminada correctamente.')
    return redirect('lista_citas')


# Gestion de Pagos

@ login_required
def lista_pagos(request):
    pagos = Pago.objects.all()
    return render(request, 'pagos/lista_pagos.html', {'pagos': pagos})


@ login_required
def registrar_pago(request):
    if request.method == 'POST':
        form = PagoForm(request.POST)
        if form.is_valid():
            pago = form.save(commit=False)
            pago.proceso = form.cleaned_data['proceso']
            pago.save()
            messages.success(request, 'Pago registrado correctamente.')
            return redirect('lista_pagos')
    else:
        form = PagoForm()
    return render(request, 'pagos/registrar_pago.html', {'form': form})


@ login_required
def editar_pago(request, pk):
    pago = get_object_or_404(Pago, pk=pk)
    if request.method == 'POST':
        form = PagoForm(request.POST, instance=pago)
        if form.is_valid():
            form.save()
            messages.success(request, 'Pago actualizado correctamente.')
            return redirect('lista_pagos')
    else:
        form = PagoForm(instance=pago)
    return render(request, 'pagos/editar_pago.html', {'form': form})


# Gestión de Cotizaciones

@ login_required
def lista_cotizaciones(request):
    cotizaciones = Cotizacion.objects.all()
    return render(request, 'cotizaciones/lista_cotizaciones.html', {'cotizaciones': cotizaciones})


@ login_required
def registrar_cotizacion(request):
    if request.method == 'POST':
        form = CotizacionForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Cotización registrada correctamente.')
            return redirect('lista_cotizaciones')
    else:
        form = CotizacionForm()
    return render(request, 'cotizaciones/registrar_cotizacion.html', {'form': form})


@ login_required
@ user_passes_test(es_admin)
def editar_cotizacion(request, pk):
    cotizacion = get_object_or_404(Cotizacion, pk=pk)
    if request.method == 'POST':
        form = CotizacionForm(request.POST, instance=cotizacion)
        if form.is_valid():
            form.save()
            messages.success(request, 'Cotización actualizada correctamente.')
            return redirect('lista_cotizaciones')
    else:
        form = CotizacionForm(instance=cotizacion)
    return render(request, 'cotizaciones/editar_cotizacion.html', {'form': form})


@ login_required
@ user_passes_test(es_admin)
def eliminar_cotizacion(request, pk):
    cotizacion = get_object_or_404(Cotizacion, pk=pk)
    cotizacion.delete()
    messages.success(request, 'Cotización eliminada correctamente.')
    return redirect('lista_cotizaciones')


@login_required
def pagar_cotizacion(request, pk):
    cotizacion = get_object_or_404(Cotizacion, pk=pk)

    if request.method == 'POST':
        if cotizacion.estado == 'Aceptada':
            response = Transaction.create(
                buy_order=str(cotizacion.id),
                session_id=str(request.session.session_key),
                amount=cotizacion.total_estimado,
                return_url='https://localhost:8000/return_url/', 
                final_url='https://localhost:8000/final_url/' 
            )

            pago = Pago(monto=cotizacion.total_estimado, metodo_pago='tarjeta', estado_pago='pendiente', cotizacion=cotizacion)
            pago.save()

            return redirect(response['url'])
        else:
            messages.error(request, 'La cotización no está en un estado válido para realizar el pago.')
    return render(request, 'cotizaciones/pagar_cotizacion.html', {'cotizacion': cotizacion})

def return_url(request):
    return JsonResponse({'message': 'Gracias por tu pago'})

def final_url(request):
    buy_order = request.GET.get('buy_order')
    token = request.GET.get('token_ws')
    response = Transaction.commit(token)

    if response['status'] == 'AUTHORIZED':
        pago = Pago.objects.get(cotizacion__id=buy_order)
        pago.estado_pago = 'completado'
        pago.save()

        cotizacion = Cotizacion.objects.get(id=buy_order)
        cotizacion.estado = 'Pagado'
        cotizacion.save()

        return JsonResponse({'message': 'Pago exitoso'})
    else:
        return JsonResponse({'message': 'Error en el pago'})

	

localhost:8000  
# Exportar a Excel


@ login_required
@ user_passes_test(es_admin)
def exportar_datos(request):
    wb = Workbook()
    ws = wb.active
    ws.title = "Datos de Procesos"

    ws.append(['ID', 'Fase de Proceso', 'Descripción', 'Fecha de Inicio',
               'Fecha de Fin', 'Estado', 'Prioridad'])

    procesos = Proceso.objects.all()
    for proceso in procesos:
        ws.append([proceso.id, proceso.fase_proceso, proceso.descripcion, proceso.fecha_inicio,
                   proceso.fecha_fin, proceso.estado_proceso, proceso.prioridad])

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename=procesos.xlsx'
    wb.save(response)
    return response

# Vista para mostrar los datos


@ login_required
@ user_passes_test(es_admin)
def mostrar_procesos(request):
    procesos = Proceso.objects.all()
    return render(request, 'exportar_datos.html', {'procesos': procesos})


# Vista de dashboard

@login_required
def dashboard(request):
    # Verificar si el usuario tiene el rol adecuado
    if not request.user.groups.filter(name__in=['Trabajadores', 'Supervisores', 'Administradores']).exists():
        return HttpResponseForbidden("No tienes permiso para ver esta página.")

    # Filtrar cotizaciones pendientes
    cotizaciones_pendientes = Cotizacion.objects.filter(
        estado='pendiente').count()

    # Filtrar ordenes activas
    ordenes_activas = Proceso.objects.filter(
        fase_proceso=['iniciado', 'en_progreso']).count()

    # Filtrar ordenes pendientes
    ordenes_pendientes = Proceso.objects.filter(
        estado_proceso='pendiente').count()

    print("Cotizaciones pendientes:", cotizaciones_pendientes)
    print("Órdenes activas:", ordenes_activas)
    print("Órdenes pendientes:", ordenes_pendientes)

    context = {
        'cotizaciones_pendientes': cotizaciones_pendientes,
        'ordenes_activas': ordenes_activas,
        'ordenes_pendientes': ordenes_pendientes,
    }

    return render(request, 'inicio.html', context)
