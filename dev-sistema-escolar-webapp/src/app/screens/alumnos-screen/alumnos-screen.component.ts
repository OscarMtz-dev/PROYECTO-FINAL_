import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EditarUserModalComponent } from 'src/app/modals/editar-user-modal/editar-user-modal.component'; // ← AGREGAR ESTA IMPORTACIÓN

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {
  public name_user: string = "";
  public rol: string = "" ;
  public token: string = "";
  public lista_alumnos: any[] = [];

  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'curp', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>([]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Ordenar "nombre" por first_name + last_name
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
      if (sortHeaderId === 'nombre') {
        const fn = (data.first_name || '').toString().trim().toLowerCase();
        const ln = (data.last_name || '').toString().trim().toLowerCase();
        return `${fn} ${ln}`;
      }
      const value = (data as any)[sortHeaderId];
      return (typeof value === 'string') ? value.toLowerCase() : value;
    };

    // Filtro por nombre, apellido, email y matrícula
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const term = (filter || '').trim().toLowerCase();
      const searchable = `${data.first_name || ''} ${data.last_name || ''} ${data.email || ''} ${data.matricula || ''}`.toLowerCase();
      return searchable.indexOf(term) !== -1;
    };
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    this.obtenerAlumnos();
  }

  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Alumnos: ", this.lista_alumnos);

          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

          // Reasignar el accessor al recrear dataSource
          this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
            if (sortHeaderId === 'nombre') {
              const fn = (data.first_name || '').toString().trim().toLowerCase();
              const ln = (data.last_name || '').toString().trim().toLowerCase();
              return `${fn} ${ln}`;
            }
            const value = (data as any)[sortHeaderId];
            return (typeof value === 'string') ? value.toLowerCase() : value;
          };

          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
      }, (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  // MODIFICAR ESTE MÉTODO - Agregar modal de edición
  public goEditar(idUser: number) {
    const dialogRef = this.dialog.open(EditarUserModalComponent,{
      data: {id: idUser, rol: 'alumno'},
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.isEdit){
        console.log("Redirigiendo a edición de alumno");
        this.router.navigate(["registro-usuarios/alumno/" + idUser]);
      }
    });
  }

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
    const userIdSession = Number(this.facadeService.getUserId());
    // Administrador puede eliminar cualquier alumno
    // Maestro solo puede eliminar su propio registro
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userIdSession === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Alumno eliminado");
        alert("Alumno eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Alumno no se ha podido eliminar.");
        console.log("No se eliminó el alumno");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este alumno.");
    }
  }
}

export interface DatosUsuario {
  id: number;
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  curp: string;
}
