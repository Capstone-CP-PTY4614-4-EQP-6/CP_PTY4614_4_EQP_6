from django import forms
from .models import CustomUserManager, CustomUser, Perfil, Dueño, Vehiculo, Servicio, Administrador, Supervisor, Trabajador, Notificacion, Proceso, Pago, Cita, Cotizacion, DetalleCotizacion
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password

# Get the custom user model
User = get_user_model()


# Formulario para el registro administradores por parte del superadmin

class AdminCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['email', 'password1', 'password2', 'is_admin']

# Formulario para el registro del trabajador por parte de un administrador


class AdminTrabajadorForm(forms.ModelForm):
    # Añadimos el campo de contraseña como un campo adicional
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))

    class Meta:
        model = Trabajador
        fields = ['rut', 'nombre', 'apellido', 'asignacion',
                  'telefono', 'email', 'direccion', 'disponibilidad', 'estado', 'rol']
        widgets = {
            'rut': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '12345678-9'}),
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido': forms.TextInput(attrs={'class': 'form-control'}),
            'asignacion': forms.Select(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '912345678'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control'}),
            'disponibilidad': forms.Select(attrs={'class': 'form-control'}),
            'estado': forms.Select(attrs={'class': 'form-control'}),
            'rol': forms.Select(attrs={'class': 'form-control'}),
        }

    def clean_password(self):
        return self.cleaned_data['password']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['rol'].initial = 'Administrador'
        self.fields['rol'].disabled = True

    def save(self, commit=True):
        # Creamos un nuevo usuario en el modelo CustomUser
        user = CustomUser.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            nombre=self.cleaned_data['nombre'],
            apellido=self.cleaned_data['apellido']
        )

        # Creamos el trabajador asociado con el usuario
        trabajador = super().save(commit=False)
        trabajador.user = user  # Asignamos el usuario al trabajador
        if commit:
            trabajador.save()  # Guardamos el trabajador en la base de datos

        return trabajador

# Formulario para el registro del supervisor por parte de un administrador


class AdminSupervisorForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))

    class Meta:
        model = Supervisor
        fields = ['rut', 'nombre', 'apellido', 'asignacion',
                  'telefono', 'email', 'direccion', 'disponibilidad', 'estado', 'rol']
        widgets = {
            'rut': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '12345678-9'}),
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido': forms.TextInput(attrs={'class': 'form-control'}),
            'asignacion': forms.Select(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '912345678'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control'}),
            'disponibilidad': forms.Select(attrs={'class': 'form-control'}),
            'estado': forms.Select(attrs={'class': 'form-control'}),
            'rol': forms.Select(attrs={'class': 'form-control'}),
        }

    def clean_password(self):
        return self.cleaned_data['password']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['rol'].initial = 'Supervisor'
        self.fields['rol'].disabled = True

    def save(self, commit=True):
        # Creamos un nuevo usuario en el modelo CustomUser
        user = CustomUser.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            nombre=self.cleaned_data['nombre'],
            apellido=self.cleaned_data['apellido']
        )

        # Creamos el supervisor asociado con el usuario
        supervisor = super().save(commit=False)
        supervisor.user = user  # Asignamos el usuario al supervisor
        if commit:
            supervisor.save()  # Guardamos el supervisor en la base de datos

        return supervisor

# Formulario para registrar la cuenta


class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput, validators=[validate_password])
    password_confirm = forms.CharField(
        widget=forms.PasswordInput, label='Confirmar contraseña')

    class Meta:
        model = User
        fields = ['email', 'nombre', 'apellido',
                  'password', 'password_confirm']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Este correo ya está en uso.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password != password_confirm:
            raise forms.ValidationError("Las contraseñas no coinciden.")

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            perfil = Perfil(user=user, rol='Dueño')  # Rol predeterminado
            perfil.save()
        return user


# Formulario para el registro del dueño (cliente)

class DueñoForm(forms.ModelForm):
    class Meta:
        model = Dueño
        fields = ['rut', 'nombre', 'apellido', 'telefono', 'direccion']
        widgets = {
            'rut': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '12345678-9'}),
            'nombre': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
            'apellido': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '912345678'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['nombre'].initial = user.nombre
            self.fields['apellido'].initial = user.apellido
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


# Formulario para el registro de vehiculos

class VehiculoForm(forms.ModelForm):
    class Meta:
        model = Vehiculo
        fields = ['patente', 'marca', 'modelo', 'año', 'color',
                  'kilometraje', 'tipo_combustible', 'fecha_ultima_revision', 'estado_vehiculo']
        widgets = {
            'patente': forms.TextInput(attrs={'class': 'form-control'}),
            'marca': forms.TextInput(attrs={'class': 'form-control'}),
            'modelo': forms.TextInput(attrs={'class': 'form-control'}),
            'año': forms.NumberInput(attrs={'class': 'form-control', 'min': '1886'}),
            'color': forms.TextInput(attrs={'class': 'form-control'}),
            'kilometraje': forms.NumberInput(attrs={'class': 'form-control'}),
            'tipo_combustible': forms.Select(attrs={'class': 'form-control'}),
            'fecha_ultima_revision': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'estado_vehiculo': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


# Formulario para la gestión de citas

class CitaForm(forms.ModelForm):
    class Meta:
        model = Cita
        fields = ['fecha_y_hora', 'motivo',
                  'estado_cita', 'ubicacion', 'vehiculo']
        widgets = {
            'fecha_y_hora': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'motivo': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
            'estado_cita': forms.Select(attrs={'class': 'form-control'}),
            'ubicacion': forms.TextInput(attrs={'class': 'form-control'}),
            'vehiculo': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''

        if user and not user.groups.filter(name__in=['Administrador', 'Supervisor']).exists():
            self.fields['estado_cita'].widget = forms.HiddenInput()


# Formulario para la gestion de servicios

class ServicioForm(forms.ModelForm):
    class Meta:
        model = Servicio
        fields = ['nombre_servicio', 'descripcion',
                  'costo', 'duracion_estimada', 'garantia']
        widgets = {
            'nombre_servicio': forms.Select(attrs={'class': 'form-control'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control'}),
            'costo': forms.NumberInput(attrs={'class': 'form-control'}),
            'duracion_estimada': forms.Select(attrs={'class': 'form-control'}),
            'garantia': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


# Formulario de pago

class PagoForm(forms.ModelForm):
    class Meta:
        model = Pago
        fields = ['monto', 'metodo_pago', 'estado_pago', 'proceso']
        widgets = {
            'monto': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '$'}),
            'metodo_pago': forms.Select(attrs={'class': 'form-control'}),
            'estado_pago': forms.Select(attrs={'class': 'form-control'}),
            'proceso': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


# Formulario para la gestion de procesos

class ProcesoForm(forms.ModelForm):
    class Meta:
        model = Proceso
        fields = ['fase_proceso', 'descripcion', 'fecha_inicio', 'fecha_fin',
                  'estado_proceso', 'prioridad', 'comentarios', 'notificaciones', 'trabajador']
        widgets = {
            'fase_proceso': forms.Select(attrs={'class': 'form-control'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
            'fecha_inicio': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'fecha_fin': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'estado_proceso': forms.Select(attrs={'class': 'form-control'}),
            'prioridad': forms.Select(attrs={'class': 'form-control'}),
            'comentarios': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
            'notificaciones': forms.Select(attrs={'class': 'form-control'}),
            'trabajador': forms.Select(attrs={'class': 'form-control'}),
            # cambiar el forms de notificaciones
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


# Formulario de notificaciones

class NotificacionForm(forms.ModelForm):
    class Meta:
        model = Notificacion
        fields = ['mensaje', 'estado', 'proceso']
        widgets = {
            'mensaje': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
            'estado': forms.Select(attrs={'class': 'form-control'}),
            'proceso': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


# Formulario de cotizacion

class CotizacionForm(forms.ModelForm):
    class Meta:
        model = Cotizacion
        fields = ['descripcion', 'monto_total', 'estado', 'vehiculo']
        widgets = {
            'descripcion': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
            'monto_total': forms.NumberInput(attrs={'class': 'form-control'}),
            'estado': forms.Select(attrs={'class': 'form-control'}),
            'vehiculo': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


# Formulario de detalle de cotizacion

class DetalleCotizacionForm(forms.ModelForm):
    class Meta:
        model = DetalleCotizacion
        fields = ['cotizacion', 'servicio']
        widgets = {
            'cotizacion': forms.Select(attrs={'class': 'form-control'}),
            'servicio': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].label_suffix = ''


class ReporteProcesosForm(forms.Form):
    fecha_inicio = forms.DateField(
        required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    fecha_fin = forms.DateField(
        required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    fases = forms.ChoiceField(choices=[('iniciado', 'Iniciado'), ('en_progreso', 'En Progreso'), (
        'finalizado', 'Finalizado')], required=False, widget=forms.CheckboxSelectMultiple)
    estado = forms.ChoiceField(
        choices=[('activo', 'Activo'), ('inactivo', 'Inactivo')], required=False)
    incluir_inactivos = forms.BooleanField(required=False, initial=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['fases'].choices = [
            (f.fase_proceso, f.fase_proceso) for f in Proceso.objects.all()]
