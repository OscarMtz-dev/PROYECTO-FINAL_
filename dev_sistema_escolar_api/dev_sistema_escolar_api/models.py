from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth.models import AbstractUser, User
from django.conf import settings

from django.db import models
from django.contrib.auth.models import User

from rest_framework.authentication import TokenAuthentication

class BearerTokenAuthentication(TokenAuthentication):
    keyword = "Bearer"


class Administradores(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, default=None)
    clave_admin = models.CharField(max_length=255,null=True, blank=True)
    telefono = models.CharField(max_length=255, null=True, blank=True)
    rfc = models.CharField(max_length=255,null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    ocupacion = models.CharField(max_length=255,null=True, blank=True)
    creation = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    update = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return "Perfil del admin "+self.first_name+" "+self.last_name
    
class Alumnos(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, default=None)
    matricula = models.CharField(max_length=255,null=True, blank=True)
    curp = models.CharField(max_length=255,null=True, blank=True)
    rfc = models.CharField(max_length=255,null=True, blank=True)
    fecha_nacimiento = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    telefono = models.CharField(max_length=255, null=True, blank=True)
    ocupacion = models.CharField(max_length=255,null=True, blank=True)
    creation = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    update = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return "Perfil del alumno "+self.first_name+" "+self.last_name
    
class Maestros(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, default=None)
    id_trabajador = models.CharField(max_length=255,null=True, blank=True)
    fecha_nacimiento = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    telefono = models.CharField(max_length=255, null=True, blank=True)
    rfc = models.CharField(max_length=255,null=True, blank=True)
    cubiculo = models.CharField(max_length=255,null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    area_investigacion = models.CharField(max_length=255,null=True, blank=True)
    materias_json = models.TextField(null=True, blank=True)
    creation = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    update = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return "Perfil del maestro "+self.first_name+" "+self.last_name
    

class EventosAcademicos(models.Model):
    TIPO_EVENTO_CHOICES = [
        ('conferencia', 'Conferencia'),
        ('taller', 'Taller'),
        ('seminario', 'Seminario'),
        ('concurso', 'Concurso'),
    ]
    
    PUBLICO_OBJETIVO_CHOICES = [
        ('estudiantes', 'Estudiantes'),
        ('profesores', 'Profesores'),
        ('publico_general', 'Público general'),
    ]
    
    PROGRAMA_EDUCATIVO_CHOICES = [
        ('icc', 'Ingeniería en Ciencias de la Computación'),
        ('lcc', 'Licenciatura en Ciencias de la Computación'),
        ('iti', 'Ingeniería en Tecnologías de la Información'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Campos según especificaciones
    nombre_evento = models.CharField(max_length=255, null=False, blank=False)
    tipo_evento = models.CharField(max_length=50, choices=TIPO_EVENTO_CHOICES)
    fecha_realizacion = models.DateField(null=False, blank=False)
    hora_inicio = models.TimeField(null=False, blank=False)
    hora_fin = models.TimeField(null=False, blank=False)
    lugar = models.CharField(max_length=255, null=False, blank=False)
    publico_objetivo = models.CharField(max_length=50, choices=PUBLICO_OBJETIVO_CHOICES)
    programa_educativo = models.CharField(max_length=50, choices=PROGRAMA_EDUCATIVO_CHOICES, null=True, blank=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='eventos_responsable')
    descripcion_breve = models.TextField(max_length=300, null=False, blank=False)
    cupo_maximo = models.IntegerField(default=0)
    
    activo = models.BooleanField(default=True)
    creation = models.DateTimeField(auto_now_add=True)
    update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre_evento} - {self.fecha_realizacion}"
