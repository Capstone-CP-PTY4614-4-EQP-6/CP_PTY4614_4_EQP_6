# Importaciones de Django
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import login, authenticate, get_user_model
from django.contrib.auth.models import User, Group
from django.contrib import messages
from django.urls import reverse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.db import IntegrityError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.mixins import UserPassesTestMixin, PermissionRequiredMixin
from fcm_django.api.rest_framework import FCMDevice
from django.core.mail import send_mail
from django.conf import settings
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from rest_framework import generics, status, permissions, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, BasePermission
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from django.contrib import auth
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


# Importaciones de la aplicación
from .models import Perfil, Dueño, Vehiculo, Proceso, Pago, Cita, Cotizacion, CustomUserManager, CustomUser, Servicio, Administrador, Supervisor, Trabajador, Notificacion, DetalleCotizacion, PasswordResetToken
from .forms import AdminCreationForm, AdminTrabajadorForm, AdminSupervisorForm, UserRegistrationForm, DueñoForm, VehiculoForm, CitaForm, ServicioForm, PagoForm, ProcesoForm, NotificacionForm, CotizacionForm, DetalleCotizacionForm, ReporteProcesosForm
from .utils import enviar_correo
from .firebase import reset_password, db, firebase_login_required
from .serializers import CitaSerializer,DueñoSerializer, VehiculoSerializer, TrabajadorSerializer, UserSerializer, UserRegistrationSerializer, ProcesoSerializer, PagoSerializer, CotizacionSerializer, PerfilSerializer

# Librerías
import pandas as pd
import mercadopago
from openpyxl import Workbook
from firebase import firebase
import json



def reset_password(request, token):
    try:
        # Buscar el token en la base de datos
        reset_token = PasswordResetToken.objects.get(token=token)

        # Verificar si el token ha expirado
        if reset_token.expiration_time < timezone.now():
            messages.error(request, "El enlace ha expirado.")
            return redirect("reset_password")

        # Verificar si el formulario de nueva contraseña se ha enviado
        if request.method == "POST":
            new_password = request.POST.get("password")
            confirm_password = request.POST.get("confirm_password")

            if new_password == confirm_password:
                # Establecer la nueva contraseña
                user = reset_token.user
                user.set_password(new_password)
                user.save()

                # Eliminar el token de restablecimiento (por seguridad)
                reset_token.delete()

                messages.success(
                    request, "Contraseña restablecida correctamente.")
                return redirect("login")
            else:
                messages.error(request, "Las contraseñas no coinciden.")

        return render(request, "reset_password.html")

    except PasswordResetToken.DoesNotExist:
        messages.error(request, "Token inválido.")
        return redirect("reset_password")

# Operación de escritura en Firebase


def agregar_datos(request):
    try:
        # Reemplaza 'mi_coleccion' y 'mi_documento' con los nombres correspondientes en Firestore
        doc_ref = db.collection('mi_coleccion').document('mi_documento')
        doc_ref.set({
            'campo1': 'valor1',
            'campo2': 'valor2',
        })
        print("Datos añadidos correctamente a Firebase")
        return JsonResponse({'mensaje': 'Datos añadidos correctamente a Firebase'})
    except Exception as e:
        print(f"Error al añadir datos: {e}")
        return JsonResponse({'error': f'Error al añadir datos: {e}'})
    

############################# VISTAS DE LA API ############################
class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            # Verifica si el usuario pertenece a los grupos 'Administradores' o si es un superadmin
            if request.user.groups.filter(name='Administradores').exists() or request.user.is_superadmin:
                return True
            else:
                print(f"Usuario {request.user.email} no tiene acceso.")  # Depuración: Verifica si está en el grupo adecuado
        return False
    
class ObtenerUsuariosView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        # Verifica si el usuario está autenticado
        if not request.user.is_authenticated:
            return Response({"detail": "No estás autenticado."}, status=401)

        # Verifica si el usuario tiene el rol adecuado
        if not (request.user.groups.filter(name='Administradores').exists() or request.user.is_superadmin):
            return Response({"detail": "No tienes permisos para acceder a esta información."}, status=403)

        dueños = Dueño.objects.all()  # Obtiene todos los usuarios
        serializer = DueñoSerializer(dueños, many=True)
        return Response(serializer.data)

# Vista para obtener o crear un perfil
class PerfilView(APIView):
    permission_classes = [IsAuthenticated]  # Asegura que solo los usuarios autenticados puedan acceder a la vista

    def get(self, request):
        try:
            perfil = Perfil.objects.get(user=request.user)  # Obtiene el perfil del usuario autenticado
            serializer = PerfilSerializer(perfil)  # Serializa los datos
            return Response(serializer.data)  # Devuelve los datos serializados en la respuesta
        except Perfil.DoesNotExist:
            return Response({"detail": "Perfil no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
    # Verificar si el usuario ya tiene un perfil asignado
        if Perfil.objects.filter(user=request.user).exists():
            return Response({"detail": "Ya existe un perfil para este usuario."}, status=status.HTTP_400_BAD_REQUEST)

    # Permitir creación manual si no tiene uno (caso específico)
        serializer = PerfilSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            perfil = Perfil.objects.get(user=request.user)  # Obtiene el perfil del usuario autenticado
        except Perfil.DoesNotExist:
            return Response({"detail": "Perfil no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PerfilSerializer(perfil, data=request.data, partial=True)  # Actualiza parcialmente el perfil
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#vista para obtener el rol
class ObtenerRolView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            perfil = Perfil.objects.get(user=request.user)
            grupos = list(request.user.groups.values_list('name', flat=True))  # Obtén los grupos del usuario
            return Response({
                "rol": perfil.rol,
                "grupos": grupos  # Incluye los grupos en la respuesta
            })
        except Perfil.DoesNotExist:
            return Response({"detail": "Perfil no encontrado."}, status=status.HTTP_404_NOT_FOUND)

#actualizar rol usuario
class PerfilViewSet(viewsets.ModelViewSet):
    queryset = Perfil.objects.all()
    serializer_class = PerfilSerializer
    permission_classes = [permissions.IsAdminUser]

class CambiarRolView(APIView):
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados
    authentication_classes = [JWTAuthentication]  # Autenticación JWT

    def get_user_role(self, user):
        # Verifica si el usuario es un admin o superadmin
        if user.is_superadmin or user.is_admin:
            return True
        return False

    def post(self, request, user_id):
        # Solo un admin o superadmin puede cambiar el rol
        if not self.get_user_role(request.user):
            return Response({"detail": "No tienes permisos para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Obtener al usuario y su perfil
            perfil = Perfil.objects.get(user_id=user_id)
        except Perfil.DoesNotExist:
            return Response({"detail": "Perfil no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        nuevo_rol = request.data.get('rol')

        # Validamos si el rol proporcionado es uno válido
        if nuevo_rol not in dict(Perfil.USER_ROLES):
            return Response({"detail": "Rol inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # Actualizamos el rol
        perfil.rol = nuevo_rol
        perfil.save()

        return Response({"detail": f"Rol actualizado a {nuevo_rol}."}, status=status.HTTP_200_OK)


# Registro
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_registrar_usuario(request):
    serializer = UserRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        # Guardamos al usuario
        user = serializer.save()

        # Verificamos si el perfil ya existe, si no, lo creamos
        perfil, created = Perfil.objects.get_or_create(user=user)

        if created:
            # Si el perfil es creado, asignamos el rol de 'dueño'
            perfil.rol = 'Dueño'
            perfil.save()

        # Generamos el token de acceso
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Retornamos la respuesta con el token
        return JsonResponse({
            'message': 'Usuario registrado exitosamente.',
            'token': access_token
        }, status=status.HTTP_201_CREATED)

    return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)




# Login
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, email=email, password=password)

    if user is not None:
        try:
            perfil = Perfil.objects.get(user=user)
            rol = perfil.rol
        except Perfil.DoesNotExist:
            return Response({"error": "El usuario no tiene un perfil asignado."}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'rol': rol,
        })
    else:
        return Response({"error": "Credenciales incorrectas."}, status=status.HTTP_401_UNAUTHORIZED)
    

# Cita CREAR
class CitaCreateAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CitaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Cita LISTAR
class ListaCitasAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        citas = Cita.objects.all()
        serializer = CitaSerializer(citas, many=True)
        return Response(serializer.data)

# Cita EDITAR
class EditarCitaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Cita.objects.get(pk=pk)
        except Cita.DoesNotExist:
            return None

    def get(self, request, pk, format=None):
        cita = self.get_object(pk)
        if cita is None:
            return Response({'detail': 'Cita no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CitaSerializer(cita)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, format=None):
        return self.update_cita(request, pk)

    def put(self, request, pk, format=None):  # Agrega el método `put`
        return self.update_cita(request, pk)

    def update_cita(self, request, pk):
        cita = self.get_object(pk)
        if cita is None:
            return Response({'detail': 'Cita no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.groups.filter(name__in=['Administrador', 'Supervisor']).exists():
            cita.estado_cita = cita.estado_cita

        serializer = CitaSerializer(cita, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vehiculo CREAR
class VehiculoCreate(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = VehiculoSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vehiculo LISTAR
class listarvehiculosAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        vehiculos = Vehiculo.objects.all()
        serializer = VehiculoSerializer(vehiculos, many=True)
        return Response(serializer.data)

# Vehiculo EDITAR
class EditarVehiculoAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Vehiculo.objects.get(pk=pk)
        except Vehiculo.DoesNotExist:
            return None

    def get(self, request, pk, format=None):
        vehiculo = self.get_object(pk)
        if vehiculo is None:
            return Response({'detail': 'Vehículo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = VehiculoSerializer(vehiculo)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, format=None):
        return self.update_vehiculo(request, pk)

    def put(self, request, pk, format=None):
        return self.update_vehiculo(request, pk)

    def update_vehiculo(self, request, pk):
        vehiculo = self.get_object(pk)
        if vehiculo is None:
            return Response({'detail': 'Vehículo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Solo los administradores y supervisores pueden editar el estado del vehículo
        if not request.user.groups.filter(name__in=['Administrador', 'Supervisor']).exists():
            vehiculo.estado_vehiculo = vehiculo.estado_vehiculo

        serializer = VehiculoSerializer(
            vehiculo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Proceso crear
class RegistrarProcesoAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ProcesoSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Proceso listar
class ListarProcesosAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=403)

        procesos = Proceso.objects.all()
        serializer = ProcesoSerializer(procesos, many=True)
        return Response(serializer.data)

#proceso editar
class EditarProcesoAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Proceso.objects.get(pk=pk)
        except Proceso.DoesNotExist:
            return None

    def get(self, request, pk, format=None):
        proceso = self.get_object(pk)
        if proceso is None:
            return Response({'detail': 'Proceso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProcesoSerializer(proceso)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, format=None):
        return self.update_proceso(request, pk)

    def put(self, request, pk, format=None):
        return self.update_proceso(request, pk)

    def update_proceso(self, request, pk):
        proceso = self.get_object(pk)
        if proceso is None:
            return Response({'detail': 'Proceso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProcesoSerializer(
            proceso, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#trabajadores listar
class lista_trabajadoresAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=403)

        trabajadores = Trabajador.objects.all()
        serializer = TrabajadorSerializer(trabajadores, many=True)
        return Response(serializer.data)

#Pagos crear
class API_registrarpago(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PagoSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)    
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class API_listarpago(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=403)

        pagos = Pago.objects.all()
        serializer = PagoSerializer(pagos, many=True)
        return Response(serializer.data)

class API_editarpago(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Pago.objects.get(pk=pk)
        except Pago.DoesNotExist:
            return None

    def get(self, request, pk, format=None):
        pago = self.get_object(pk)
        if pago is None:
            return Response({'detail': 'Pago no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk, format=None):
        return self.update_pago(request, pk)

    def put(self, request, pk, format=None):
        return self.update_pago(request, pk)

    def update_pago(self, request, pk):
        pago = self.get_object(pk)
        if pago is None:
            return Response({'detail': 'Pago no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PagoSerializer(
            pago, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#cOTIZACION LISTAR
class ListarCotizacionesAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=403)

        cotizaciones = Cotizacion.objects.all()
        serializer = CotizacionSerializer(cotizaciones, many=True)
        return Response(serializer.data)

#COTIZACION Registrar
class RegistrarCotizacionAPI(APIView):
    authentication_classes = [JWTAuthentication]    
    permission_classes = [IsAuthenticated]
    serializer_class = CotizacionSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)    
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#COTIZACION EDITAR
class EditarCotizacionAPI(APIView):    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Cotizacion.objects.get(pk=pk)
        except Cotizacion.DoesNotExist:
            return None

    def get(self, request, pk, format=None):
        cotizacion = self.get_object(pk)
        if cotizacion is None:
            return Response({'detail': 'Cotizacion no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CotizacionSerializer(cotizacion)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def patch(self, request, pk, format=None):
        return self.update_cotizacion(request, pk)

    def put(self, request, pk, format=None):
        return self.update_cotizacion(request, pk)

    def update_cotizacion(self, request, pk):
        cotizacion = self.get_object(pk)
        if cotizacion is None:
            return Response({'detail': 'Cotizacion no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CotizacionSerializer(
            cotizacion, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#COTIZACION ELIMINAR
class EliminarCotizacionAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]  # Agregar permisos específicos si necesario

    def delete(self, request, pk):
        # Buscar la cotización por ID
        cotizacion = get_object_or_404(Cotizacion, pk=pk)

        # Eliminar la cotización
        cotizacion.delete()

        # Responder con un mensaje de éxito
        return Response(
            {"message": "Cotización eliminada correctamente."},
            status=status.HTTP_200_OK
        )

#COTIZACION PAGAR
class PagarCotizacionAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Obtener la cotización
        try:
            cotizacion = Cotizacion.objects.get(pk=pk)
        except Cotizacion.DoesNotExist:
            return Response({"error": "Cotización no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        # Validar estado de la cotización
        if cotizacion.estado != 'Aceptada':
            return Response({"error": "La cotización no está en un estado válido para realizar el pago."}, status=status.HTTP_400_BAD_REQUEST)

        # Procesar el pago con MercadoPago
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        payment_data = {
            "transaction_amount": float(cotizacion.total_estimado),
            "token": request.data.get('token'),
            "description": f"Cotización {cotizacion.id}",
            "installments": 1,
            "payment_method_id": request.data.get('payment_method_id'),
            "payer": {
                "email": request.user.email,
            }
        }

        payment_response = sdk.payment().create(payment_data)
        payment = payment_response.get("response", {})
        
        if payment.get("status") == "approved":
            # Guardar el pago en la base de datos
            Pago.objects.create(
                monto=cotizacion.total_estimado,
                metodo_pago='mercadopago',
                estado_pago='completado',
                cotizacion=cotizacion
            )

            # Actualizar estado de la cotización
            cotizacion.estado = 'Pagado'
            cotizacion.save()

            return Response({"message": "Pago realizado con éxito."}, status=status.HTTP_200_OK)
        
        # Manejar errores de pago
        return Response({"error": f"Error en el pago: {payment.get('status_detail')}"}, status=status.HTTP_400_BAD_REQUEST)

#PAGAR
class ReturnURLAPI(APIView):
    permission_classes = [AllowAny]  # No requiere autenticación

    def get(self, request):
        return Response({'message': 'Gracias por tu pago'}, status=status.HTTP_200_OK)

#FINAL
class FinalURLAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payment_id = request.query_params.get('payment_id')
        status = request.query_params.get('status')
        merchant_order_id = request.query_params.get('merchant_order_id')

        if not payment_id or not status or not merchant_order_id:
            return Response({'error': 'Faltan parámetros en la solicitud.'}, status=status.HTTP_400_BAD_REQUEST)

        if status == 'approved':
            try:
                # Actualizar el estado del pago
                pago = Pago.objects.get(cotizacion__id=merchant_order_id)
                pago.estado_pago = 'completado'
                pago.save()

                # Actualizar el estado de la cotización
                cotizacion = Cotizacion.objects.get(id=merchant_order_id)
                cotizacion.estado = 'Pagado'
                cotizacion.save()

                return Response({'message': 'Pago exitoso'}, status=status.HTTP_200_OK)
            except (Pago.DoesNotExist, Cotizacion.DoesNotExist):
                return Response({'error': 'No se encontró la cotización o el pago correspondiente.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'message': 'Error en el pago'}, status=status.HTTP_400_BAD_REQUEST)


#########################final vistas api#######################




# Usuario

CustomUser = get_user_model()


# Administrador


def superadmin_required(view_func):
    decorated_view_func = user_passes_test(
        lambda u: u.is_active and getattr(u, 'is_superadmin', False))(view_func)
    return decorated_view_func


@ firebase_login_required
@ superadmin_required
def create_admin(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        try:
            # Crear usuario en Firebase
            user_firebase = crear_usuario(email, password)

            # Crear perfil de usuario en Django y asociarlo con el ID de Firebase
            perfil_usuario = Perfil.objects.create(
                user_firebase_id=user_firebase.uid,
                email=email,
                rol='Admin'
            )

            messages.success(request, f'Usuario {email} creado exitosamente.')
            # Redirigir al dashboard de admin o la vista que desees
            return redirect('admin_dashboard')

        except ValueError as e:
            messages.error(request, f'Error al crear el usuario: {str(e)}')
            # Asegúrate de tener el template adecuado
            return render(request, 'crear_admin.html')

    return render(request, 'crear_admin.html')

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
    if user.is_staff or user.groups.filter(name='Administradores').exists():
        return True
    else:
        print(f"Usuario {user.username} no tiene permisos de administrador.")
        return False

# Vista de inicio


def inicio(request):
    is_dueño = request.user.groups.filter(
        name="Dueños").exists() if request.user.is_authenticated else False
    is_supervisor = request.user.groups.filter(
        name="Supervisores").exists() if request.user.is_authenticated else False
    is_administrador = request.user.groups.filter(
        name="Administradores").exists() if request.user.is_authenticated else False
    is_trabajador = request.user.groups.filter(
        name="Trabajadores").exists() if request.user.is_authenticated else False

    context = {
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
            if user.perfil.rol == 'Administrador':
                return redirect('admin')
            elif user.perfil.rol == 'Dueño':
                return redirect('dueño')
            elif user.perfil.rol == 'Supervisor':
                return redirect('supervisor')
            elif user.perfil.rol == 'Trabajador':
                return redirect('trabajador')
            else:
                return redirect('inicio')
        else:
            messages.error(request, 'Email o contraseña incorrectos')
    return render(request, 'login.html')


# Vista para la creacion de trabajadores (solo accesible por administradores)


@ firebase_login_required
@ perfil_requerido
@ user_passes_test(es_admin)
def crear_trabajador(request):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    if request.method == 'POST':
        form = AdminTrabajadorForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']

            # Verificar si el correo electrónico ya existe
            if CustomUser.objects.filter(email=email).exists():
                form.add_error(
                    'email', 'Este correo electrónico ya está en uso.')
            else:
                password = form.cleaned_data['password']

                # Crear el usuario personalizado
                user = CustomUser.objects.create_user(
                    email=email,
                    password=password
                )

                # Asignar el perfil al trabajador
                trabajador = form.save(commit=False)
                trabajador.perfil = Perfil.objects.create(
                    CustomUser=user, rol='Trabajador')
                trabajador.save()

                messages.success(request, 'Trabajador creado con éxito')
                return redirect('inicio')
    else:
        form = AdminTrabajadorForm()

    return render(request, 'trabajadores/crear_trabajador.html', {'form': form})


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def lista_trabajadores(request):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    trabajadores = Trabajador.objects.all()
    return render(request, 'trabajadores/lista_trabajadores.html', {'trabajadores': trabajadores})


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def editar_trabajador(request, trabajador_id):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    trabajador = get_object_or_404(Trabajador, id=trabajador_id)

    if request.method == 'POST':
        form = AdminTrabajadorForm(request.POST, instance=trabajador)
        if form.is_valid():
            form.save()
            messages.success(request, 'Trabajador editado con éxito')
            return redirect('lista_trabajadores')
    else:
        form = AdminTrabajadorForm(instance=trabajador)

    return render(request, 'trabajadores/editar_trabajador.html', {'form': form})


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def eliminar_trabajador(request, trabajador_id):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    trabajador = get_object_or_404(Trabajador, id=trabajador_id)

    if request.method == 'POST':
        try:
            trabajador.delete()
            messages.success(request, 'Trabajador eliminado con éxito')
        except Exception as e:
            messages.error(request, f'Error eliminando trabajador: {str(e)}')
        return redirect('lista_trabajadores')

    return render(request, 'trabajadores/eliminar_trabajador.html', {'trabajador': trabajador})


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def bloquear_trabajador(request, trabajador_id):
    trabajador = get_object_or_404(Trabajador, id=trabajador_id)
    trabajador.bloqueado = True
    trabajador.save()
    return redirect('lista_trabajadores')


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def desbloquear_trabajador(request, trabajador_id):
    trabajador = get_object_or_404(Trabajador, id=trabajador_id)
    trabajador.bloqueado = False
    trabajador.save()
    return redirect('lista_trabajadores')

# Vista para gestionar los supervisores (solo accesible por administradores)


@ firebase_login_required
@perfil_requerido
@user_passes_test(es_admin)
def lista_supervisores(request):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')
    supervisores = Supervisor.objects.all()
    return render(request, 'supervisores/lista_supervisores.html', {'supervisores': supervisores})


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def crear_supervisor(request):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    if request.method == 'POST':
        form = AdminSupervisorForm(request.POST)
        if form.is_valid():
            supervisor = form.save(commit=False)
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = CustomUser.objects.create_user(
                email=email, password=password)
            supervisor.perfil = Perfil.objects.create(
                user=user, rol='Supervisor')
            supervisor.save()
            messages.success(request, 'Supervisor creado con éxito')
            return redirect('inicio')
    else:
        form = AdminSupervisorForm()
    return render(request, 'supervisores/crear_supervisor.html', {'form': form})


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def editar_supervisor(request, supervisor_id):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    supervisor = get_object_or_404(Supervisor, id=supervisor_id)

    if request.method == 'POST':
        form = AdminSupervisorForm(request.POST, instance=supervisor)
        if form.is_valid():
            form.save()
            messages.success(request, 'Supervisor editado con éxito')
            return redirect('lista_supervisores')
    else:
        form = AdminSupervisorForm(instance=supervisor)
    return render(request, 'supervisores/editar_supervisor.html', {'form': form, 'supervisor': supervisor})


@ firebase_login_required
@ perfil_requerido
@user_passes_test(es_admin)
def eliminar_supervisor(request, supervisor_id):
    if not es_admin(request.user):
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('inicio')

    supervisor = get_object_or_404(Supervisor, id=supervisor_id)

    if request.method == 'POST':
        try:
            supervisor.delete()
            messages.success(request, 'Supervisor eliminado con éxito')
        except Exception as e:
            messages.error(request, f'Error eliminando supervisor: {str(e)}')
        return redirect('lista_supervisores')
    return render(request, 'supervisores/eliminar_supervisor.html', {'supervisor': supervisor})


@ firebase_login_required
@user_passes_test(es_admin)
def bloquear_supervisor(request, supervisor_id):
    supervisor = get_object_or_404(Supervisor, id=supervisor_id)

    if not supervisor.bloqueado:
        supervisor.bloqueado = True
        supervisor.save()
        messages.success(request, f"Supervisor {
                         supervisor.nombre} bloqueado correctamente.")
    else:
        messages.info(request, f"El supervisor {
                      supervisor.nombre} ya está bloqueado.")

    return redirect('lista_supervisores')


@ firebase_login_required
@user_passes_test(es_admin)
def desbloquear_supervisor(request, supervisor_id):
    supervisor = get_object_or_404(Supervisor, id=supervisor_id)

    if supervisor.bloqueado:
        supervisor.bloqueado = False
        supervisor.save()
        messages.success(request, f"Supervisor {
                         supervisor.nombre} desbloqueado correctamente.")
    else:
        messages.info(request, f"El supervisor {
                      supervisor.nombre} ya está desbloqueado.")

    return redirect('lista_supervisores')

# Mi cuenta


@ firebase_login_required
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

@ firebase_login_required
def lista_dueños(request):
    dueños = Dueño.objects.all()
    return render(request, 'dueños/lista_dueños.html', {'dueños': dueños})


@ firebase_login_required
def registrar_dueño(request):

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


@ firebase_login_required
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


@ firebase_login_required
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


@ firebase_login_required
@user_passes_test(es_admin)
def bloquear_dueño(request, dueño_id):
    dueño = get_object_or_404(Dueño, id=dueño_id)
    dueño.bloqueado = True
    dueño.save()
    return redirect('lista_dueños')


@ firebase_login_required
@user_passes_test(es_admin)
def desbloquear_dueño(request, dueño_id):
    dueño = get_object_or_404(Dueño, id=dueño_id)
    dueño.bloqueado = False
    dueño.save()
    return redirect('lista_dueños')

# Gestión de Vehículos


@ firebase_login_required
def lista_vehiculos(request):
    try:
        dueño = request.user.dueño
    except ObjectDoesNotExist:
        messages.error(request, "No tienes un vehiculo registrado")
        return redirect('inicio')

    vehiculos = dueño.vehiculos.all()

    paginator = Paginator(vehiculos, 10)
    page_number = request.GET.get('page')
    vehiculos_page = paginator.get_page(page_number)

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


@ firebase_login_required
def registrar_vehiculo(request):
    if not (request.user.groups.filter(name='Dueños').exists() or
            request.user.groups.filter(name='Administradores').exists() or
            request.user.groups.filter(name='Trabajadores').exists() or
            request.user.groups.filter(name='Supervisores').exists()):
        messages.error(request, 'No tiene permisos para registrar vehículos')
        return redirect('inicio')

    if request.method == 'POST':
        form = VehiculoForm(request.POST)
        if form.is_valid():
            vehiculo = form.save(commit=False)
            vehiculo.dueño = request.user.dueño
            vehiculo.save()
            messages.success(request, 'Vehículo registrado correctamente')
            return redirect('lista_vehiculos')
        else:
            print(form.errors)
    else:
        form = VehiculoForm()

    return render(request, 'vehiculos/registrar_vehiculo.html', {'form': form})


@ firebase_login_required
def editar_vehiculo(request, pk):
    vehiculo = get_object_or_404(Vehiculo, pk=pk)

    if vehiculo.dueño != request.user.dueño:
        messages.error(request, "No tienes permiso para editar este vehículo")
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


@ firebase_login_required
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

@ firebase_login_required
def lista_procesos(request):
    procesos = Proceso.objects.all()
    return render(request, 'procesos/lista_procesos.html', {'procesos': procesos})


# Registrar proceso asociado a una reparacion

@ firebase_login_required
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
                detalles_proceso = f"ID del proceso: {
                    proceso.id}, Descripción: {proceso.descripcion}"

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


@ firebase_login_required
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

@ firebase_login_required
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

@ firebase_login_required
def lista_citas(request):
    citas = Cita.objects.all()
    return render(request, 'citas/lista_citas.html', {'citas': citas})


@ firebase_login_required
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


@ firebase_login_required
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


@ firebase_login_required
def eliminar_cita(request, pk):
    cita = get_object_or_404(Cita, pk=pk)
    cita.delete()
    messages.success(request, 'Cita eliminada correctamente.')
    return redirect('lista_citas')


# Gestion de Pagos

@ firebase_login_required
def lista_pagos(request):
    pagos = Pago.objects.all()
    return render(request, 'pagos/lista_pagos.html', {'pagos': pagos})


@ firebase_login_required
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


@ firebase_login_required
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

@ firebase_login_required
def lista_cotizaciones(request):
    cotizaciones = Cotizacion.objects.all()
    return render(request, 'cotizaciones/lista_cotizaciones.html', {'cotizaciones': cotizaciones})


@ firebase_login_required
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


@ firebase_login_required
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


@ firebase_login_required
@ user_passes_test(es_admin)
def eliminar_cotizacion(request, pk):
    cotizacion = get_object_or_404(Cotizacion, pk=pk)
    cotizacion.delete()
    messages.success(request, 'Cotización eliminada correctamente.')
    return redirect('lista_cotizaciones')


@ firebase_login_required
def pagar_cotizacion(request, pk):
    cotizacion = get_object_or_404(Cotizacion, pk=pk)

    if request.method == 'POST':
        if cotizacion.estado == 'Aceptada':
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

            payment_data = {
                "transaction_amount": float(cotizacion.total_estimado),
                "token": request.POST.get('token'),
                "description": f"Cotización {cotizacion.id}",
                "installments": 1,
                "payment_method_id": request.POST.get('payment_method_id'),
                "payer": {
                    "email": request.user.email,
                }
            }

            payment_response = sdk.payment().create(payment_data)
            payment = payment_response["response"]

            if payment["status"] == "approved":
                pago = Pago(
                    monto=cotizacion.total_estimado,
                    metodo_pago='mercadopago',
                    estado_pago='completado',
                    cotizacion=cotizacion
                )
                pago.save()

                cotizacion.estado = 'Pagado'
                cotizacion.save()

                messages.success(request, 'Pago realizado con éxito.')
                return redirect('lista_cotizaciones')
            else:
                messages.error(request, f'Error en el pago: {
                               payment["status_detail"]}')
        else:
            messages.error(
                request, 'La cotización no está en un estado válido para realizar el pago.')
    return render(request, 'cotizaciones/pagar_cotizacion.html', {'cotizacion': cotizacion})


def return_url(request):
    return JsonResponse({'message': 'Gracias por tu pago'})


def final_url(request):
    payment_id = request.GET.get('payment_id')
    status = request.GET.get('status')
    merchant_order_id = request.GET.get('merchant_order_id')

    if status == 'approved':
        pago = Pago.objects.get(cotizacion__id=merchant_order_id)
        pago.estado_pago = 'completado'
        pago.save()

        cotizacion = Cotizacion.objects.get(id=merchant_order_id)
        cotizacion.estado = 'Pagado'
        cotizacion.save()

        return JsonResponse({'message': 'Pago exitoso'})
    else:
        return JsonResponse({'message': 'Error en el pago'})


# Exportar a Excel


@ firebase_login_required
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


# Vista para mostrar los datos y el formulario
@ firebase_login_required
@user_passes_test(es_admin)
def configurar_reporte_procesos(request):
    form = ReporteProcesosForm()  # Asumiendo que has creado el formulario de filtros
    return render(request, 'procesos/reporte_form.html', {'form': form})

# Vista para exportar los procesos filtrados


@ firebase_login_required
@user_passes_test(es_admin)
def exportar_procesos(request):
    if request.method == 'GET':
        return configurar_reporte_procesos(request)

    form = ReporteProcesosForm(request.POST)
    if not form.is_valid():
        return render(request, 'procesos/reporte_form.html', {'form': form})

    # Obtener parámetros del formulario
    fecha_inicio = form.cleaned_data.get('fecha_inicio')
    fecha_fin = form.cleaned_data.get('fecha_fin')
    fases = form.cleaned_data.get('fases')
    estado = form.cleaned_data.get('estado')
    incluir_inactivos = form.cleaned_data.get('incluir_inactivos')

    # Crear el libro de Excel
    wb = Workbook()
    ws_resumen = wb.active
    ws_resumen.title = "Resumen de Procesos"

    # Agregar parámetros del reporte
    ws_resumen.append(['REPORTE DE PROCESOS'])
    ws_resumen.append(
        ['Fecha de generación:', timezone.now().strftime('%Y-%m-%d %H:%M:%S')])
    ws_resumen.append(['Parámetros del reporte:'])
    ws_resumen.append(['Fecha inicio:', fecha_inicio or 'No especificada'])
    ws_resumen.append(['Fecha fin:', fecha_fin or 'No especificada'])
    ws_resumen.append(['Fases:', ', '.join(fases) if fases else 'Todas'])
    ws_resumen.append(['Estado:', estado or 'Todos'])
    ws_resumen.append([])

    # Filtrar procesos según parámetros
    procesos = Proceso.objects.all()

    if not incluir_inactivos:
        procesos = procesos.filter(estado_proceso='activo')

    if fecha_inicio:
        procesos = procesos.filter(fecha_inicio__gte=fecha_inicio)

    if fecha_fin:
        procesos = procesos.filter(fecha_fin__lte=fecha_fin)

    if fases:
        procesos = procesos.filter(fase_proceso__in=fases)

    if estado:
        procesos = procesos.filter(estado_proceso=estado)

    # Agregar los datos de los procesos al archivo Excel
    ws_resumen.append(['ID Proceso', 'Fase', 'Descripción',
                      'Fecha de inicio', 'Fecha de fin', 'Estado'])
    for proceso in procesos:
        ws_resumen.append([proceso.id_proceso, proceso.fase_proceso, proceso.descripcion,
                          proceso.fecha_inicio, proceso.fecha_fin, proceso.estado_proceso])

    # Crear la respuesta HTTP con el archivo Excel
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename=Reporte_Procesos_{
        timezone.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

    wb.save(response)
    return response

    return render(request, 'inicio.html', context)
