# Asegúrate de importar la vista
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *
from . import views
from django.urls import path


urlpatterns = [
    #Ruta para obtener el rol
    path('api/rol/', ObtenerRolView.as_view(), name='rol'),
    # Ruta para acceder a la gestión de perfiles  
    path('api/perfil/', PerfilView.as_view(), name='perfil'),

    # Usando JWT para el inicio de sesión
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),  # Ruta para refrescar el token

    path('api/citas/', ListaCitasAPI.as_view(), name='lista_citas_api'),
    path('api/citas/<int:pk>/', EditarCitaAPIView.as_view(), name='editar_cita_api'),
    path('api/citas/crear/', CitaCreateAPI.as_view(), name='crear_cita_api'),

    path('api/vehiculos/', listarvehiculosAPI.as_view(),
         name='lista_vehiculos_api'),
    path('api/vehiculos/<int:pk>/', EditarVehiculoAPI.as_view(),
         name='editar_vehiculo_api'),
    path('api/vehiculos/crear/', VehiculoCreate.as_view(),
         name='crear_vehiculo_api'),

    path('api/procesos/', ListarProcesosAPI.as_view(), name='lista_api_procesos'),
    path('api/procesos/<int:pk>/', EditarProcesoAPI.as_view(),
         name='editar_api_procesos'),
    path('api/procesos/crear/', RegistrarProcesoAPI.as_view(),
         name='registrar_api_procesos'),

    path('api/trabajadores/', lista_trabajadoresAPI.as_view(),
         name='lista_api_trabajadores'),

    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/register/', api_registrar_usuario, name='register'),
    path('api/mi-cuenta/', mi_cuenta, name='mi_cuenta'),

    path('api/pagos/', API_listarpago.as_view(), name='listar_pagos'),
    path('api/pagos/<int:pk>/', API_editarpago.as_view(), name='editar_pago'),
    path('api/pagos/crear/', API_registrarpago.as_view(), name='registrar_pago'),

    path('api/cotizaciones/', ListarCotizacionesAPI.as_view(), name='listar_cotizaciones'),
    path('api/cotizaciones/<int:pk>/', EditarCotizacionAPI.as_view(), name='editar_cotizacion'),
    path('api/cotizaciones/crear/', RegistrarCotizacionAPI.as_view(), name='registrar_cotizacion'),
    path('api/cotizaciones/eliminar/<int:pk>/', EliminarCotizacionAPI.as_view(), name='eliminar_cotizacion'),
    path('api/cotizaciones/pagar/<int:pk>/', PagarCotizacionAPI.as_view(), name='pagar_cotizacion'),


     path('api/admin/cambiar-rol/<int:user_id>/', CambiarRolView.as_view(), name='cambiar-rol'),
     path('api/admin/usuarios/', ObtenerUsuariosView.as_view(), name='obtener-usuarios'),

    # Ruta para el formulario de inicio de sesión
    # Ruta para mostrar el formulario de inicio de sesión

]

