from rest_framework import serializers, generics
from .models import Cita, Vehiculo, Proceso, Pago, CustomUser, Trabajador
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from datetime import datetime
# Serializers

#Registro
CustomUser = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'nombre', 'apellido', 'password']  # Cambia `first_name` y `last_name` por `nombre` y `apellido`
    
    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])  # Asegúrate de que la contraseña se guarde de manera segura
        user.save()
        return user

#Login
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password')

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Asegúrate de hash la contraseña
        user.save()
        return user
#Citas
class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'
        
#Vehiculos
class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'

    def validate_año(self, value):
        if value < 1886 or value > datetime.now().year:
            raise serializers.ValidationError("Año inválido para el vehículo.")
        return value
#Procesos
class ProcesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proceso
        fields = '__all__'

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'

class TrabajadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trabajador
        fields = '__all__'