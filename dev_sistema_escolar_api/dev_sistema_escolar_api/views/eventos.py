from django.db.models import *
from django.db import transaction
from dev_sistema_escolar_api.serializers import UserSerializer, EventoSerializer, MaestroSerializer, AdminSerializer
from dev_sistema_escolar_api.models import *
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.models import Group
from datetime import datetime

class EventosAll(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, *args, **kwargs):
        # Filtrar por rol del usuario según especificaciones
        user_group = request.user.groups.first().name if request.user.groups.exists() else None
        
        eventos = EventosAcademicos.objects.filter(activo=True)
        
        # Filtros por rol según punto 19-20 del PDF
        if user_group == 'alumno':
            eventos = eventos.filter(publico_objetivo__in=['estudiantes', 'publico_general'])
        elif user_group == 'maestro':
            eventos = eventos.filter(publico_objetivo__in=['profesores', 'publico_general'])
        # Administrador ve todos los eventos
        
        eventos = eventos.order_by("fecha_realizacion")
        lista = EventoSerializer(eventos, many=True).data
        return Response(lista, 200)

class EventosView(generics.CreateAPIView):
    def get_permissions(self):
        if self.request.method in ['GET', 'PUT', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return []
    
    # Obtener evento por ID
    def get(self, request, *args, **kwargs):
        evento = get_object_or_404(EventosAcademicos, id=request.GET.get("id"))
        evento_data = EventoSerializer(evento, many=False).data
        return Response(evento_data, 200)
    
    # Crear nuevo evento (solo admin)
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # Validar que sea administrador
        user_group = request.user.groups.first().name if request.user.groups.exists() else None
        if user_group != 'administrador':
            return Response({"message": "Solo administradores pueden crear eventos"}, 403)
            
        evento_data = request.data.copy()
        evento_data['user'] = request.user.id
        
        # Si público objetivo no es estudiantes, limpiar programa_educativo
        if evento_data.get('publico_objetivo') != 'estudiantes':
            evento_data['programa_educativo'] = None
            
        print("Datos recibidos:", evento_data)  # ← AGREGAR ESTO PARA DEBUG
        evento = EventoSerializer(data=evento_data)
        
        if evento.is_valid():
            evento.save()
            return Response({"evento_creado_id": evento.instance.id}, 201)
        
        print("Errores del serializer:", evento.errors)  # ← AGREGAR ESTO PARA DEBUG
        return Response(evento.errors, status=status.HTTP_400_BAD_REQUEST)
        
    # Actualizar evento (solo admin)
    @transaction.atomic
    def put(self, request, *args, **kwargs):
        # Validar que sea administrador
        user_group = request.user.groups.first().name if request.user.groups.exists() else None
        if user_group != 'administrador':
            return Response({"message": "Solo administradores pueden editar eventos"}, 403)
            
        evento = get_object_or_404(EventosAcademicos, id=request.data["id"])
        
        # Actualizar campos
        evento.nombre_evento = request.data["nombre_evento"]
        evento.tipo_evento = request.data["tipo_evento"]
        evento.fecha_realizacion = request.data["fecha_realizacion"]
        evento.hora_inicio = request.data["hora_inicio"]
        evento.hora_fin = request.data["hora_fin"]
        evento.lugar = request.data["lugar"]
        evento.publico_objetivo = request.data["publico_objetivo"]
        
        # Solo actualizar programa educativo si público objetivo es estudiantes
        if request.data["publico_objetivo"] == 'estudiantes':
            evento.programa_educativo = request.data.get("programa_educativo")
        else:
            evento.programa_educativo = None
            
        evento.responsable_id = request.data["responsable"]
        evento.descripcion_breve = request.data["descripcion_breve"]
        evento.cupo_maximo = request.data["cupo_maximo"]
        evento.save()
        
        return Response({"message": "Evento actualizado correctamente", "evento": EventoSerializer(evento).data}, 200)
    
    # Eliminar evento (solo admin - desactivar)
    @transaction.atomic
    def delete(self, request, *args, **kwargs):
        # Validar que sea administrador
        user_group = request.user.groups.first().name if request.user.groups.exists() else None
        if user_group != 'administrador':
            return Response({"message": "Solo administradores pueden eliminar eventos"}, 403)
            
        evento = get_object_or_404(EventosAcademicos, id=request.GET.get("id"))
        try:
            evento.delete()
            return Response({"details": "Evento eliminado"}, 200)
        except Exception as e:
            return Response({"details": "Algo pasó al eliminar"}, 400)