# Generated by Django 4.2 on 2024-11-09 20:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('miapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trabajador',
            name='asignacion',
            field=models.CharField(choices=[('mecanico', 'Mecánico'), ('pintor', 'Pintor'), ('electrico', 'Eléctrico')], max_length=50),
        ),
    ]
