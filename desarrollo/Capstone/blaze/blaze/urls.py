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

urlpatterns = [
    path('admin/', admin.site.urls),

    # URL para el inicio
    path('', views.inicio, name='inicio'),

    # URL para el login

    path('login/', views.login_view, name='login'),

    # URL para mi cuenta

    path('mi-cuenta/', views.mi_cuenta, name='mi_cuenta'),

    # URL usuario

    path('registrar-usuario/', views.registrar_usuario, name='registrar_usuario'),

    # URLs para vehiculos
    path('registrar-vehiculo/', views.registrar_vehiculo,
         name='registro_vehiculo'),  # Registrar vehículo
    path('vehiculos/', views.lista_vehiculos,
         name='lista_vehiculos'),  # Listar vehículos
    path('editar-vehiculo/<int:id>/', views.editar_vehiculo,
         name='editar_vehiculo'),  # Editar vehículo

    # URLs para dueños
    path('registrar-dueño/', views.registrar_dueño,
         name='registro_dueño'),  # Registrar dueño
    path('dueños/', views.lista_dueños, name='lista_dueños'),  # Listar dueños
    path('editar-dueño/<int:id>/', views.editar_dueño,
         name='editar_dueño'),  # Editar dueño

    # URLs para citas
    path('registrar-cita/', views.registrar_cita,
         name='registro_cita'),  # Registrar cita
    path('citas/', views.lista_citas, name='lista_citas'),  # Listar citas
    path('editar-cita/<int:id>/', views.editar_cita,
         name='editar_cita'),  # Editar cita

    # URLs para pagos
    path('registrar-pago/', views.registrar_pago,
         name='registro_pago'),  # Registrar pago
    path('pagos/', views.lista_pagos, name='lista_pagos'),  # Listar pagos
    path('editar-pago/<int:id>/', views.editar_pago,
         name='editar_pago'),  # Editar pago

    # URLs para reparaciones
    path('registrar-reparacion/', views.registrar_reparacion,
         name='registro_reparacion'),  # Registrar reparación
    path('reparaciones/', views.lista_reparaciones,
         name='lista_reparaciones'),  # Listar reparaciones
    path('editar-reparacion/<int:id>/', views.editar_reparacion,
         name='editar_reparacion'),  # Editar reparación
]
