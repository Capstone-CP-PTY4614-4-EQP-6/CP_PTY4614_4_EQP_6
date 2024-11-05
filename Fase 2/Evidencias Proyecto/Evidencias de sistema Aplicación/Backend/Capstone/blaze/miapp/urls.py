# miapp/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CitaCreate, VehiculoCreate, api_registrar_usuario, mi_cuenta, login_form_view, api_lista_procesos, api_listar_pagos  # Asegúrate de importar la vista

urlpatterns = [
    path('api/citas/', CitaCreate.as_view(), name='api_citas'),
    path('api/vehiculos/', VehiculoCreate.as_view(), name='api_vehiculos'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Usando JWT para el inicio de sesión
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Ruta para refrescar el token
    path('api/register/', api_registrar_usuario, name='register'),
    path('api/mi-cuenta/', mi_cuenta, name='mi_cuenta'),
    path('api/procesos', api_lista_procesos, name='api_procesos'),
    # Ruta para el formulario de inicio de sesión
    path('login/', login_form_view, name='login_form'),  # Ruta para mostrar el formulario de inicio de sesión
    path('api/pagos/', api_listar_pagos, name='listar_pagos'),
]


