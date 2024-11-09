from django.contrib import admin
from .models import CustomUser, Administrador, Dueño, Vehiculo, Servicio, Trabajador, Supervisor, Proceso, Pago, Cita, Cotizacion

admin.site.register(Dueño)
admin.site.register(Trabajador)
admin.site.register(Supervisor)
admin.site.register(Administrador)
admin.site.register(Vehiculo)
admin.site.register(Servicio)
admin.site.register(Proceso)
admin.site.register(Pago)
admin.site.register(Cita)
admin.site.register(CustomUser)


class VehiculoInline(admin.TabularInline):
    model = Vehiculo
    extra = 1


class CotizacionAdmin(admin.ModelAdmin):
    list_display = ('vehiculo', 'estado', 'total_estimado', 'fecha_creacion')
    search_fields = ('vehiculo__patente',)
    list_filter = ('estado',)
    readonly_fields = ('total_estimado', 'fecha_creacion')
    ordering = ('-fecha_creacion',)


admin.site.register(Cotizacion, CotizacionAdmin)
