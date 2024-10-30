# Importaciones de Django
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
from fcm_django.api.rest_framework import FCMDevice
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Importaciones de la aplicación
from .models import Dueño, Vehiculo, Trabajador, Cita, Pago, Servicio, Proceso, Perfil, Cotizacion, DetalleCotizacion, CustomUser, Notificacion
from .forms import DueñoForm, VehiculoForm, TrabajadorForm, CitaForm, ServicioForm, PagoForm, ProcesoForm, UserRegistrationForm, CotizacionForm, DetalleCotizacionForm, NotificacionForm

# Librerias
import pandas as pd
from openpyxl import Workbook

# Token notificaciones


@api_view(['POST'])
def registrar_dispositivo(request):
    from fcm_django.api.rest_framework import FCMDevice

    token = request.data.get('token')

    if token:
        device, created = FCMDevice.objects.get_or_create(
            registration_id=token,
            defaults={'name': request.data.get('name', 'Dispositivo sin nombre')}
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
            return HttpResponseForbidden('No tienes un perfil asociado.')
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
    return render(request, 'inicio.html')

# Vista del login


def login_view(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Bienvenido {user.first_name}!")

            # Redirección según el rol del usuario
            if user.perfil.rol == 'Admin':
                return redirect('inicio')
            elif user.perfil.rol == 'Dueño':
                return redirect('inicio')
            else:
                return redirect('inicio')
        else:
            messages.error(request, 'Email o contraseña incorrectos.')
    return render(request, 'login.html')


# Vista para la creacion de trabajadores (solo accesible por administradores)


#@ login_required
#@ perfil_requerido
#@ user_passes_test(es_admin)
def crear_trabajador(request):
    if request.user.perfil.rol != 'Admin':
        messages.error(
            request, 'No tienes permiso para acceder a esta página.')
        return redirect('inicio')  # Redirigir a la vista de inicio

    if request.method == 'POST':
        form = TrabajadorForm(request.POST)
        if form.is_valid():
            trabajador = form.save(commit=False)
            # Crear usuario y asignar el perfil correspondiente
            email = form.cleaned_data['email']
            # Asegúrate de tener este campo en tu formulario
            password = form.cleaned_data['password']
            user = CustomUser.objects.create_user(
                email=email, password=password)
            trabajador.perfil = Perfil.objects.create(
                user=user, rol='Trabajador')
            trabajador.save()
            messages.success(request, 'Trabajador creado con éxito.')
            return redirect('inicio')
    else:
        form = TrabajadorForm()
    return render(request, 'trabajadores/crear_trabajador.html', {'form': form})

# Vista para gestionar la lista de trabajadores (solo accesible por administradores)


#@ login_required
#@user_passes_test(es_admin)
def lista_trabajadores(request):
    if request.user.perfil.rol != 'Admin':
        messages.error(
            request, 'No tienes permiso para acceder a esta página.')
        return redirect('inicio')

    trabajadores = Trabajador.objects.all()
    return render(request, 'trabajadores/lista_trabajadores.html', {'trabajadores': trabajadores})


#@login_required
#@user_passes_test(es_admin)
def editar_trabajador(request, id_trabajador):
    if request.user.perfil.rol != 'Admin':
        messages.error(
            request, 'No tienes permiso para acceder a esta página.')
        return redirect('inicio')

    trabajador = get_object_or_404(Trabajador, id_trabajador=id_trabajador)

    if request.method == 'POST':
        form = TrabajadorForm(request.POST, instance=trabajador)
        if form.is_valid():
            form.save()
            messages.success(request, 'Trabajador editado con éxito.')
            return redirect('lista_trabajadores')
    else:
        form = TrabajadorForm(instance=trabajador)

    return render(request, 'trabajadores/editar_trabajador.html', {'form': form})


#@login_required
#@user_passes_test(es_admin)
def eliminar_trabajador(request, id_trabajador):
    # Verifica que solo los administradores puedan acceder
    if request.user.perfil.rol != 'Admin':
        messages.error(
            request, 'No tienes permiso para acceder a esta página.')
        return redirect('inicio')  # Redirigir a la vista de inicio

    trabajador = get_object_or_404(Trabajador, id_trabajador=id_trabajador)

    if request.method == 'POST':
        trabajador.delete()
        messages.success(request, 'Trabajador eliminado con éxito.')
        return redirect('lista_trabajadores')

    return render(request, 'trabajadores/eliminar_trabajador.html', {'trabajador': trabajador})


# Mi cuenta


#@login_required
def mi_cuenta(request):
    user = request.user
    try:
        perfil = user.perfil
    except Perfil.DoesNotExist:
        perfil = None

    vehiculos = None
    procesos = None
    pagos = None

    if perfil:
        try:
            dueño = Dueño.objects.get(user=user)
            vehiculos = Vehiculo.objects.filter(dueño=dueño)
            procesos = Proceso.objects.filter(vehiculo__dueño=dueño)
            pagos = Pago.objects.filter(reparacion__vehiculo__dueño=dueño)
        except Dueño.DoesNotExist:
            dueño = None
        except Exception as e:
            print(f"Error al obtener el dueño: {e}")

        if perfil.rol == 'trabajador':
            procesos = Proceso.objects.filter(trabajador=perfil)

    if not procesos:
        procesos = Proceso.objects.all()

    context = {
        'user': user,
        'vehiculos': vehiculos,
        'procesos': procesos,
        'pagos': pagos,
    }

    return render(request, 'mi_cuenta.html', context)


# Usuario
CustomUser = get_user_model()


def registrar_usuario(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            first_name = form.cleaned_data['first_name']
            last_name = form.cleaned_data['last_name']

            user = CustomUser.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=form.cleaned_data['password']
            )
            # Crear el perfil para el usuario
            perfil = Perfil(user=user, rol='Cliente')
            perfil.save()

            messages.success(request, 'Usuario registrado exitosamente.')
            return redirect('inicio')
    else:
        form = UserRegistrationForm()

    return render(request, 'registrar_usuario.html', {'form': form})

# Gestión de Clientes


#@ login_required
def lista_dueños(request):
    dueños = Dueño.objects.all()
    return render(request, 'dueños/lista_dueños.html', {'dueños': dueños})


#@login_required
def registrar_dueño(request):
    # Verifica si el usuario ya está registrado como dueño
    if hasattr(request.user, 'dueño'):
        messages.error(request, 'Este usuario ya está registrado como dueño.')
        return redirect('inicio')

    if request.method == 'POST':
        form = DueñoForm(request.POST)
        if form.is_valid():
            nuevo_dueño = form.save(commit=False)
            nuevo_dueño.user = request.user
            nuevo_dueño.save()

            # Asignar grupo dueños al usuario
            grupo, created = Group.objects.get_or_create(name='dueños')
            request.user.groups.add(grupo)  # Añadir al grupo de usuario

            # Crear o actualizar el perfil del usuario
            perfil, created = Perfil.objects.get_or_create(user=request.user)
            perfil.rol = 'Dueño'
            perfil.save()

            messages.success(request, 'Dueño registrado correctamente.')
            return redirect('inicio')
        else:
            messages.error(request, 'Por favor corrige los errores en el formulario.')
    else:
        form = DueñoForm()

    return render(request, 'dueños/registrar_dueño.html', {'form': form})



#@login_required
def editar_dueño(request, id):
    dueño = get_object_or_404(Dueño, id=id)
    if request.method == 'POST':
        form = DueñoForm(request.POST, instance=dueño)
        if form.is_valid():
            form.save()
            messages.success(request, 'Dueño actualizado correctamente.')
            return redirect('lista_dueños')
    else:
        form = DueñoForm(instance=dueño)
    return render(request, 'dueños/editar_dueño.html', {'form': form, 'dueño': dueño})


#@ login_required
#@ user_passes_test(es_admin)
def eliminar_dueño(request, dueño_id):
    dueño = get_object_or_404(Dueño, id=dueño_id)
    dueño.delete()
    messages.success(request, 'Dueño eliminado correctamente.')
    return redirect('lista_dueños')


# Gestión de Vehículos


#@login_required
def lista_vehiculos(request):
    try:
        # Intentar obtener el dueño del usuario autenticado
        dueño = request.user.dueño
    except ObjectDoesNotExist:
        # Si el usuario no tiene un dueño asociado mostrar un mensaje de error
        messages.error(request, "El usuario no tiene un dueño asociado.")
        return redirect('inicio')

    # Usando la relación inversa para obtener los vehículos
    vehiculos = dueño.vehiculos.all()  # Aquí se utiliza la relación inversa

    # Crear un diccionario que asocie cada vehículo con sus procesos
    vehiculos_procesos = [
        {
            'vehiculo': vehiculo,
            'procesos': Proceso.objects.filter(vehiculo=vehiculo)
        } for vehiculo in vehiculos
    ]

    return render(request, 'vehiculos/lista_vehiculos.html', {
        'vehiculos_procesos': vehiculos_procesos
    })


#@ login_required
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


#@ login_required
def editar_vehiculo(request, pk):
    vehiculo = get_object_or_404(Vehiculo, pk=pk)

    if vehiculo.dueño != request.user.dueño:
        messages.error(request, "No tienes permiso para editar este vehículo.")
        return redirect('lista_vehiculos')

    if request.method == 'POST':
        form = VehiculoForm(request.POST, instance=vehiculo)
        if form.is_valid():
            form.save()
            messages.success(request, 'Vehículo actualizado correctamente.')
            return redirect('lista_vehiculos')
    else:
        form = VehiculoForm(instance=vehiculo)

    return render(request, 'vehiculos/editar_vehiculo.html', {'form': form})


#@login_required
def eliminar_vehiculo(request, vehiculo_id):
    vehiculo = get_object_or_404(Vehiculo, id=vehiculo_id)

    if vehiculo.dueño != request.user.dueño:
        messages.error(
            request, "No tienes permiso para eliminar este vehículo.")
        return redirect('lista_vehiculos')

    vehiculo.delete()
    messages.success(request, 'Vehículo eliminado correctamente.')
    return redirect('lista_vehiculos')

# Gestión de Reparaciones


#@ login_required
def lista_procesos(request):
    procesos = Proceso.objects.all()
    return render(request, 'procesos/lista_procesos.html', {'procesos': procesos})

# Registrar proceso asociado a una reparación (solo accesible por administradores)


#@ login_required
#@ user_passes_test(es_admin)
def registrar_proceso(request):
    if request.method == 'POST':
        form = ProcesoForm(request.POST)
        if form.is_valid():
            proceso = form.save(commit=False)
            proceso.save()  # Guardar el proceso
            messages.success(request, 'Proceso registrado correctamente.')
            return redirect('lista_procesos')
    else:
        form = ProcesoForm()
    return render(request, 'procesos/registrar_proceso.html', {'form': form})

# Editar proceso de reparación


#@ login_required
#@ user_passes_test(es_admin)
def editar_proceso(request, pk):
    proceso = get_object_or_404(Proceso, pk=pk)
    if request.method == 'POST':
        form = ProcesoForm(request.POST, instance=proceso)
        if form.is_valid():
            form.save()
            messages.success(request, 'Proceso actualizado correctamente.')
            return redirect('lista_procesos')
    else:
        form = ProcesoForm(instance=proceso)
    return render(request, 'procesos/editar_proceso.html', {'form': form})

# Eliminar proceso


#@ login_required
#@ user_passes_test(es_admin)
def eliminar_proceso(request, pk):
    proceso = get_object_or_404(Proceso, pk=pk)
    proceso.delete()
    messages.success(request, 'Proceso eliminado correctamente.')
    return redirect('lista_procesos')

# Función para permitir solo a supervisores


def es_supervisor(user):
    return user.groups.filter(name='Supervisores').exists()


# Gestión de Citas


#@ login_required
def lista_citas(request):
    citas = Cita.objects.all()
    return render(request, 'citas/lista_citas.html', {'citas': citas})


#@login_required
def editar_cita(request, pk):
    cita = get_object_or_404(Cita, pk=pk)
    if request.method == 'POST':
        form = CitaForm(request.POST, instance=cita)
        if form.is_valid():
            form.save()
            messages.success(request, 'Cita actualizada correctamente.')
            return redirect('lista_citas')
    else:
        form = CitaForm(instance=cita)
    return render(request, 'citas/editar_cita.html', {'form': form, 'cita': cita})


#@ login_required
def registrar_cita(request):
    if request.method == 'POST':
        form = CitaForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lista_citas')
    else:
        form = CitaForm()
    return render(request, 'citas/registrar_cita.html', {'form': form})


#@ login_required
def eliminar_cita(request, pk):
    cita = get_object_or_404(Cita, pk=pk)
    cita.delete()
    messages.success(request, 'Cita eliminada correctamente.')
    return redirect('lista_citas')

# Gestión de Pagos


#@ login_required
def lista_pagos(request):
    pagos = Pago.objects.all()
    return render(request, 'pagos/lista_pagos.html', {'pagos': pagos})


#@ login_required
def registrar_pago(request):
    if request.method == 'POST':
        form = PagoForm(request.POST)
        if form.is_valid():
            pago = form.save(commit=False)
            # Asignar el proceso en lugar de reparación
            pago.proceso = form.cleaned_data['proceso']
            pago.save()
            messages.success(request, 'Pago registrado correctamente.')
            return redirect('lista_pagos')
    else:
        form = PagoForm()
    return render(request, 'pagos/registrar_pago.html', {'form': form})


#@ login_required
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


#@ login_required
def lista_cotizaciones(request):
    cotizaciones = Cotizacion.objects.all()
    return render(request, 'cotizaciones/lista_cotizaciones.html', {'cotizaciones': cotizaciones})


#@ login_required
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


#@ login_required
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


#@ login_required
#@ user_passes_test(es_admin)
def eliminar_cotizacion(request, pk):
    cotizacion = get_object_or_404(Cotizacion, pk=pk)
    cotizacion.delete()
    messages.success(request, 'Cotización eliminada correctamente.')
    return redirect('lista_cotizaciones')

# Exportar a Excel


#@ login_required
#@ user_passes_test(es_admin)
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


#@ login_required
#@ user_passes_test(es_admin)
def mostrar_procesos(request):
    procesos = Proceso.objects.all()  # Obtener todos los procesos
    return render(request, 'exportar_datos.html', {'procesos': procesos})


# Vista de dashboard

#@login_required
def dashboard(request):
    # Verificar si el usuario tiene el rol adecuado
    if not request.user.groups.filter(name__in=['Trabajadores', 'Supervisores', 'Administradores']).exists():
        return HttpResponseForbidden("No tienes permiso para ver esta página.")

    # Filtrar cotizaciones pendientes
    cotizaciones_pendientes = Cotizacion.objects.filter(
        estado='pendiente').count()

    # Filtrar ordenes activas
    ordenes_activas = Proceso.objects.filter(
        fase_proceso__in=['iniciado', 'en_progreso']).count()

    # Filtrar ordenes pendientes
    ordenes_pendientes = Proceso.objects.filter(
        estado_proceso='pendiente').count()

    context = {
        'cotizaciones_pendientes': cotizaciones_pendientes,
        'ordenes_activas': ordenes_activas,
        'ordenes_pendientes': ordenes_pendientes
    }

    return render(request, 'inicio.html', context)