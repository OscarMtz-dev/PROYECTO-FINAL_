import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) { }

  // Esquema para evento nuevo
  public esquemaEvento(){
    return {
      nombre_evento: '',
      tipo_evento: '',
      fecha_realizacion: '',
      hora_inicio: '',
      hora_fin: '',
      lugar: '',
      publico_objetivo: '',
      programa_educativo: '',
      responsable: '',
      descripcion_breve: '',
      cupo_maximo: ''
    };
  }

  // Obtener todos los eventos
  public obtenerEventos(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/eventos-all/`, { headers });
  }

  // Obtener evento por ID
  public obtenerEventoPorID(idEvento: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/eventos-view/?id=${idEvento}`, { headers });
  }

  // Registrar nuevo evento
  public registrarEvento(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/eventos-view/`, data, { headers });
  }

  public actualizarEvento(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/eventos-view/`, data, { headers });
  }

  // Eliminar evento
  public eliminarEvento(idEvento: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/eventos-view/?id=${idEvento}`, { headers });
  }

  // Obtener lista de responsables - Versión simple y secuencial
public obtenerResponsables(): Observable<any>{
  return new Observable(observer => {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    const responsables: any[] = [];

    // Primero obtener maestros
    this.http.get<any>(`${environment.url_api}/lista-maestros/`, { headers }).subscribe(
      (maestros: any[]) => {
        if (maestros && Array.isArray(maestros)) {
          maestros.forEach((maestro: any) => {
            if (maestro.user && maestro.user.id) {
              responsables.push({
                id: maestro.user.id,
                nombre: `${maestro.user.first_name} ${maestro.user.last_name}`,
                tipo: 'maestro'
              });
            }
          });
        }

        // Luego obtener administradores
        this.http.get<any>(`${environment.url_api}/lista-admins/`, { headers }).subscribe(
          (administradores: any[]) => {
            if (administradores && Array.isArray(administradores)) {
              administradores.forEach((admin: any) => {
                if (admin.user && admin.user.id) {
                  responsables.push({
                    id: admin.user.id,
                    nombre: `${admin.user.first_name} ${admin.user.last_name}`,
                    tipo: 'administrador'
                  });
                }
              });
            }

            observer.next(responsables);
            observer.complete();
          }
        );
      }
    );
  });
}

  // VALIDACIONES SEGÚN ESPECIFICACIONES DEL PROFESOR (se mantiene igual)
  public validarEvento(data: any, editar: boolean): any {
    let errors: any = {};

    // 1. Nombre del evento - Solo letras, números y espacios
    if (!data.nombre_evento) {
      errors.nombre_evento = "El nombre del evento es obligatorio";
    } else if (!/^[a-zA-Z0-9\s]+$/.test(data.nombre_evento)) {
      errors.nombre_evento = "Solo se permiten letras, números y espacios";
    }

    // 2. Tipo de evento - Obligatorio
    if (!data.tipo_evento) {
      errors.tipo_evento = "El tipo de evento es obligatorio";
    }

    // 3. Fecha de realización - No fechas pasadas
    if (!data.fecha_realizacion) {
      errors.fecha_realizacion = "La fecha de realización es obligatoria";
    } else {
      const fechaEvento = new Date(data.fecha_realizacion);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaEvento < hoy) {
        errors.fecha_realizacion = "No se pueden seleccionar fechas pasadas";
      }
    }

    // 4. Horario - Hora inicio debe ser menor que hora fin
    if (!data.hora_inicio) {
      errors.hora_inicio = "La hora de inicio es obligatoria";
    }
    if (!data.hora_fin) {
      errors.hora_fin = "La hora de finalización es obligatoria";
    }
    if (data.hora_inicio && data.hora_fin && data.hora_inicio >= data.hora_fin) {
      errors.hora_fin = "La hora final debe ser mayor que la hora de inicio";
    }

    // 5. Lugar - Solo alfanuméricos y espacios
    if (!data.lugar) {
      errors.lugar = "El lugar es obligatorio";
    } else if (!/^[a-zA-Z0-9\s]+$/.test(data.lugar)) {
      errors.lugar = "Solo se permiten caracteres alfanuméricos y espacios";
    }

    // 6. Público objetivo - Obligatorio
    if (!data.publico_objetivo) {
      errors.publico_objetivo = "El público objetivo es obligatorio";
    }

    // 7. Programa educativo - Solo si público objetivo es "estudiantes"
    if (data.publico_objetivo === 'estudiantes' && !data.programa_educativo) {
      errors.programa_educativo = "El programa educativo es obligatorio para eventos estudiantiles";
    }

    // 8. Responsable - Obligatorio
    if (!data.responsable) {
      errors.responsable = "El responsable del evento es obligatorio";
    }

    // 9. Descripción breve - Máximo 300 caracteres, solo letras, números y puntuación básica
    if (!data.descripcion_breve) {
      errors.descripcion_breve = "La descripción breve es obligatoria";
    } else if (data.descripcion_breve.length > 300) {
      errors.descripcion_breve = "La descripción no puede exceder 300 caracteres";
    } else if (!/^[a-zA-Z0-9\s.,;:!?()\-]+$/.test(data.descripcion_breve)) {
      errors.descripcion_breve = "Solo se permiten letras, números y signos de puntuación básicos";
    }

    // 10. Cupo máximo - Números enteros positivos, máximo 3 dígitos
    if (!data.cupo_maximo) {
      errors.cupo_maximo = "El cupo máximo es obligatorio";
    } else if (!/^\d+$/.test(data.cupo_maximo.toString())) {
      errors.cupo_maximo = "Solo se permiten números enteros";
    } else if (data.cupo_maximo <= 0) {
      errors.cupo_maximo = "El cupo debe ser un número positivo";
    } else if (data.cupo_maximo > 999) {
      errors.cupo_maximo = "El cupo no puede exceder 3 dígitos";
    }

    return errors;
  }
}
