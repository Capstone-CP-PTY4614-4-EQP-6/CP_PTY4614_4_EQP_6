from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import  EditarVehiculoAPI, listarvehiculosAPI, EditarCitaAPIView, ListaCitasAPI,CitaCreateAPI, VehiculoCreate, api_registrar_usuario, mi_cuenta, login_form_view, ListarProcesosAPI, EditarProcesoAPI, RegistrarProcesoAPI, api_listar_pagos, lista_trabajadoresAPI  # Asegúrate de importar la vista

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Usando JWT para el inicio de sesión
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Ruta para refrescar el token

    path('api/citas/', ListaCitasAPI.as_view(), name='lista_citas_api'),
    path('api/citas/<int:pk>/', EditarCitaAPIView.as_view(), name='editar_cita_api'),
    path('api/citas/crear/', CitaCreateAPI.as_view(), name='crear_cita_api'),

    path('api/vehiculos/', listarvehiculosAPI.as_view(), name='lista_vehiculos_api'),
    path('api/vehiculos/<int:pk>/', EditarVehiculoAPI.as_view(), name='editar_vehiculo_api'),
    path('api/vehiculos/crear/', VehiculoCreate.as_view(), name='crear_vehiculo_api'),

    path('api/procesos/', ListarProcesosAPI.as_view(), name='lista_api_procesos'),
    path('api/procesos/<int:pk>/', EditarProcesoAPI.as_view(), name='editar_api_procesos'),
    path('api/procesos/crear/', RegistrarProcesoAPI.as_view(), name='registrar_api_procesos'),

    path('api/trabajadores/', lista_trabajadoresAPI.as_view(), name='lista_api_trabajadores'),

    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/register/', api_registrar_usuario, name='register'),
    path('api/mi-cuenta/', mi_cuenta, name='mi_cuenta'),
    # Ruta para el formulario de inicio de sesión
    path('login/', login_form_view, name='login_form'),  # Ruta para mostrar el formulario de inicio de sesión
    path('api/pagos/', api_listar_pagos, name='listar_pagos'),
]


