"""
URL configuration for blaze project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from miapp import views
from django.urls import include
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),

    # Gestion de usuarios
    path('', views.inicio, name='inicio'),
    path('login/', views.login_view, name='login'),
    path('mi-cuenta/', views.mi_cuenta, name='mi_cuenta'),
    path('registrar-usuario/', views.registrar_usuario, name='registrar_usuario'),

    path('reset-password/', views.reset_password, name='reset_password'),

    # Recuperacion de contraseña
    path('password_reset/', auth_views.PasswordResetView.as_view(),
         name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(),
         name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(),
         name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(),
         name='password_reset_complete'),

    # Gestion de vehiculos
    path('vehiculos/registrar/', views.registrar_vehiculo,
         name='registro_vehiculo'),
    path('vehiculos/', views.lista_vehiculos, name='lista_vehiculos'),
    path('vehiculos/editar/<int:pk>/',
         views.editar_vehiculo, name='editar_vehiculo'),
    path('vehiculos/eliminar/<int:vehiculo_id>/',
         views.eliminar_vehiculo, name='eliminar_vehiculo'),

    # Gestion de dueños
    path('dueños/registrar/', views.registrar_dueño, name='registro_dueño'),
    path('dueños/', views.lista_dueños, name='lista_dueños'),
    path('dueños/editar/<int:id>/', views.editar_dueño, name='editar_dueño'),
    path('dueños/eliminar/<int:dueño_id>/',
         views.eliminar_dueño, name='eliminar_dueño'),
    path('dueños/bloquear/<int:id>/', views.bloquear_dueño, name='bloquear_dueño'),
    path('dueños/desbloquear/<int:id>/',
         views.desbloquear_dueño, name='desbloquear_dueño'),

    # Gestion de trabajadores
    path('trabajadores/', views.lista_trabajadores, name='lista_trabajadores'),
    path('trabajadores/crear/', views.crear_trabajador, name='crear_trabajador'),
    path('trabajadores/editar/<int:id_trabajador>/',
         views.editar_trabajador, name='editar_trabajador'),
    path('trabajadores/eliminar/<int:id_trabajador>/',
         views.eliminar_trabajador, name='eliminar_trabajador'),
    path('trabajadores/bloquear/<int:id>/',
         views.bloquear_trabajador, name='bloquear_trabajador'),
    path('trabajadores/desbloquear/<int:id>/',
         views.desbloquear_trabajador, name='desbloquear_trabajador'),

    # Gestion de supervisores
    path('supervisores/', views.lista_supervisores, name='listar_supervisores'),
    path('supervisores/crear/', views.crear_supervisor, name='crear_supervisor'),
    path('supervisores/editar/<int:supervisor_id>/',
         views.editar_supervisor, name='editar_supervisor'),
    path('supervisores/eliminar/<int:supervisor_id>/',
         views.eliminar_supervisor, name='eliminar_supervisor'),
    path('supervisores/bloquear/<int:id>/',
         views.bloquear_supervisor, name='bloquear_supervisor'),
    path('supervisores/desbloquear/<int:id>/',
         views.desbloquear_supervisor, name='desbloquear_supervisor'),

    # Gestion de citas
    path('citas/registrar/', views.registrar_cita, name='registro_cita'),
    path('citas/', views.lista_citas, name='lista_citas'),
    path('citas/editar/<int:pk>/', views.editar_cita, name='editar_cita'),
    path('citas/eliminar/<int:pk>/', views.eliminar_cita, name='eliminar_cita'),

    # Gestion de pagos
    path('pagos/registrar/', views.registrar_pago, name='registro_pago'),
    path('pagos/', views.lista_pagos, name='lista_pagos'),
    path('pagos/editar/<int:pk>/', views.editar_pago, name='editar_pago'),

    # Gestion procesos
    path('procesos/registrar/', views.registrar_proceso,
         name='registro_proceso'),
    path('procesos/', views.lista_procesos, name='lista_procesos'),
    path('procesos/editar/<int:pk>/',
         views.editar_proceso, name='editar_proceso'),
    path('procesos/eliminar/<int:pk>/',
         views.eliminar_proceso, name='eliminar_proceso'),

    # Gestion de cotizaciones
    path('cotizaciones/registrar/', views.registrar_cotizacion,
         name='registrar_cotizacion'),
    path('cotizaciones/', views.lista_cotizaciones, name='lista_cotizaciones'),
    path('cotizaciones/editar/<int:pk>/',
         views.editar_cotizacion, name='editar_cotizacion'),
    path('cotizaciones/eliminar/<int:pk>/',
         views.eliminar_cotizacion, name='eliminar_cotizacion'),
    path('pagar-cotizacion/<int:pk>/',
         views.pagar_cotizacion, name='pagar_cotizacion'),
    path('return_url/', views.return_url, name='return_url'),
    path('final_url/', views.final_url, name='final_url'),

    # Ruta para mostrar los datos de procesos
    path('procesos/', views.mostrar_procesos, name='mostrar_procesos'),

    # Ruta para exportar los datos a Excel
    path('exportar-datos/', views.exportar_datos, name='exportar_datos'),

]
