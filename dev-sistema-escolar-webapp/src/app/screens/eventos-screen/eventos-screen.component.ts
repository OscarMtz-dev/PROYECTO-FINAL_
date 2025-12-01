import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';
import { EliminarEventoModalComponent } from 'src/app/modals/eliminar-evento-modal/eliminar-evento-modal.component'; // ← AGREGAR ESTO

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit {

  public eventos: any[] = [];
  public dataSource = new MatTableDataSource<any>();
  public displayedColumns: string[] = [];

  public isAdmin: boolean = false;
  public isMaestro: boolean = false;
  public isAlumno: boolean = false;

  public name_user: string = '';
  public rol: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private eventosService: EventosService,
    private facadeService: FacadeService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.obtenerUsuario();
    this.verificarPermisos();
    this.obtenerEventos();
  }

  // Obtener información del usuario logeado
  public obtenerUsuario() {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
  }

  // Verificar permisos según el rol
  public verificarPermisos() {
    const userGroup = this.facadeService.getUserGroup();

    this.isAdmin = userGroup === 'administrador';
    this.isMaestro = userGroup === 'maestro';
    this.isAlumno = userGroup === 'alumno';

    // Definir columnas según permisos (puntos 19-20 del PDF)
    if (this.isAdmin) {
      this.displayedColumns = ['nombre_evento', 'tipo_evento', 'fecha', 'lugar', 'publico_objetivo', 'cupo_maximo', 'editar', 'eliminar'];
    } else {
      this.displayedColumns = ['nombre_evento', 'tipo_evento', 'fecha', 'lugar', 'publico_objetivo', 'cupo_maximo'];
    }
  }

  // Obtener todos los eventos
  public obtenerEventos() {
    this.eventosService.obtenerEventos().subscribe(
      (response) => {
        this.eventos = response;
        this.dataSource.data = this.eventos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log('Eventos cargados:', this.eventos);
      },
      (error) => {
        console.error('Error al cargar eventos:', error);
        alert('Error al cargar la lista de eventos');
      }
    );
  }

  // Filtrar eventos
  public aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Formatear fecha para mostrar
  public formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX');
  }

  // Formatear tipo de evento
  public formatearTipoEvento(tipo: string): string {
    const tipos: any = {
      'conferencia': 'Conferencia',
      'taller': 'Taller',
      'seminario': 'Seminario',
      'concurso': 'Concurso'
    };
    return tipos[tipo] || tipo;
  }

  // Formatear público objetivo
  public formatearPublicoObjetivo(publico: string): string {
    const publicos: any = {
      'estudiantes': 'Estudiantes',
      'profesores': 'Profesores',
      'publico_general': 'Público General'
    };
    return publicos[publico] || publico;
  }

  // MODIFICAR ESTE MÉTODO - Agregar modal de edición
  public editarEvento(evento: any) {
    if (this.isAdmin) {
      const dialogRef = this.dialog.open(EditarEventoModalComponent,{
        data: {id: evento.id, nombre: evento.nombre_evento},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result && result.isEdit){
          console.log("Redirigiendo a edición de evento");
          this.router.navigate(['/registro-eventos', evento.id]);
        }
      });
    }
  }

  // MODIFICAR ESTE MÉTODO - Agregar modal de eliminación
  public eliminarEvento(evento: any) {
    if (this.isAdmin) {
      const dialogRef = this.dialog.open(EliminarEventoModalComponent,{
        data: {id: evento.id, nombre: evento.nombre_evento},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result && result.isDelete){
          console.log("Evento eliminado");
          alert("Evento eliminado correctamente.");
          this.obtenerEventos(); // Recargar lista
        }else{
          console.log("Eliminación cancelada");
        }
      });
    }
  }
}
