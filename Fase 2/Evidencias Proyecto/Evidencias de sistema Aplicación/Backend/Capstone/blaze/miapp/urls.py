from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import  listarvehiculosAPI, EditarCitaAPIView, ListaCitasAPI,CitaCreate, VehiculoCreate, api_registrar_usuario, mi_cuenta, login_form_view, api_lista_procesos, api_listar_pagos  # Asegúrate de importar la vista

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Usando JWT para el inicio de sesión
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Ruta para refrescar el token

    path('api/citas/', ListaCitasAPI.as_view(), name='lista_citas_api'),
    path('api/citas/<int:pk>/', EditarCitaAPIView.as_view(), name='editar_cita_api'),

    path('api/vehiculos/', listarvehiculosAPI.as_view(), name='lista_vehiculos_api'),

    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/register/', api_registrar_usuario, name='register'),
    path('api/mi-cuenta/', mi_cuenta, name='mi_cuenta'),
    path('api/procesos', api_lista_procesos, name='api_procesos'),
    # Ruta para el formulario de inicio de sesión
    path('login/', login_form_view, name='login_form'),  # Ruta para mostrar el formulario de inicio de sesión
    path('api/pagos/', api_listar_pagos, name='listar_pagos'),
]


