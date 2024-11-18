Proyecto Blaze - Sistema de Gestión para Talleres Automotrices


Descripción:
Blaze es una aplicación web diseñada para optimizar la gestión de talleres automotrices, facilitando el registro de vehículos, la gestión de órdenes de trabajo, la reserva de citas en línea, la comunicación con los clientes y los pagos en línea. Esta solución permite a los talleres mejorar la eficiencia operativa, la transparencia y la satisfacción del cliente.


Características:
- Registro de vehículos: Añadir y gestionar la información de los vehículos.
- Gestión de órdenes de trabajo: Crear, asignar y finalizar órdenes de trabajo.
- Reserva de citas: Sistema de reservas en línea.
- Notificaciones automáticas: Envío de notificaciones por correo electrónico sobre el estado de las reparaciones.
- Pagos en línea: Integración de distintos métodos de pago para los servicios realizados.

Instalación
Sigue los pasos a continuación para instalar y ejecutar el proyecto localmente:

1.- Crea y activa un entorno virtual:

python -m venv env
source env/bin/activate  # Para Linux/macOS
env\Scripts\activate  # Para Windows

2.- Instala las dependencias:

pip install -r requirements.txt

3.- Configura la base de datos:

python manage.py migrate

4.- Ejecuta el servidor de desarrollo:

python manage.py runserver


Uso:
- Accede a la aplicación en tu navegador en http://localhost:8000/.
. Regístrate o inicia sesión para empezar a gestionar vehículos, órdenes de trabajo y más.

Estructura del Proyecto

blaze/
├── blaze/              # Directorio principal de la aplicación
│   ├── settings.py     # Configuración del proyecto
│   ├── urls.py         # Enrutamiento de la aplicación
│   ├── wsgi.py         
│   └── ...
├── miapp/              # Directorio de aplicaciones personalizadas
│   ├── vehiculos/      # Módulo de gestión de vehículos
│   ├── procesos/       # Módulo de órdenes de trabajo
│   └── ...
├── static/             # Archivos CSS
├── templates/          # Plantillas HTML
└── README.md           # Este archivo
  
