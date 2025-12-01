import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { EventosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_evento: any = {};

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idEvento: number = 0;
  public listaResponsables: any[] = [];
  public cargandoResponsables: boolean = false;
  public fechaHoy: Date = new Date();

  // Opciones para los selects
  public tiposEvento: any[] = [
    { value: 'conferencia', viewValue: 'Conferencia' },
    { value: 'taller', viewValue: 'Taller' },
    { value: 'seminario', viewValue: 'Seminario' },
    { value: 'concurso', viewValue: 'Concurso' }
  ];

  public publicosObjetivo: any[] = [
    { value: 'estudiantes', viewValue: 'Estudiantes' },
    { value: 'profesores', viewValue: 'Profesores' },
    { value: 'publico_general', viewValue: 'Público general' }
  ];

  public programasEducativos: any[] = [
    { value: 'icc', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'lcc', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'iti', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  constructor(
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    // Verificar permisos - Solo administradores pueden editar/crear
    const userGroup = this.facadeService.getUserGroup();
    if (userGroup !== 'administrador') {
      alert('No tienes permisos para acceder a esta función');
      this.router.navigate(['/home']);
      return;
    }

    // EXACTAMENTE COMO MAESTROS - PERO CON OBSERVABLE
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);

      // ESPERAR A QUE LLEGUEN LOS DATOS DEL PADRE
      setTimeout(() => {
        this.evento = this.datos_evento;
        console.log("Evento después de timeout: ", this.evento);
        this.cargarResponsables();
      }, 100);

    }else{
      // Va a registrar un nuevo evento
      this.evento = this.eventosService.esquemaEvento();
      this.token = this.facadeService.getSessionToken();
      this.cargarResponsables();
    }

    console.log("Evento inicial: ", this.evento);
  }

  // Cargar lista de responsables
  public cargarResponsables() {
    this.cargandoResponsables = true;
    this.eventosService.obtenerResponsables().subscribe(
      (responsables) => {
        this.listaResponsables = responsables;
        this.cargandoResponsables = false;
      },
      (error) => {
        console.error('Error al cargar responsables:', error);
        this.cargandoResponsables = false;
        alert('Error al cargar la lista de responsables');
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    // Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Formatear fecha para backend
    const datosParaEnviar = {
      ...this.evento,
      fecha_realizacion: this.formatearFechaParaBackend(this.evento.fecha_realizacion)
    };

    this.eventosService.registrarEvento(datosParaEnviar).subscribe(
      (response) => {
        alert('Evento registrado correctamente');
        console.log('Evento registrado:', response);
        this.router.navigate(['/eventos']);
      },
      (error) => {
        alert('Error al registrar el evento');
        console.error('Error:', error);
      }
    );
  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if(Object.keys(this.errors).length > 0){
      console.log("Errores de validación:", this.errors);
      return false;
    }

    // FORMATEAR FECHA PARA BACKEND - AGREGAR ESTO
    const datosParaEnviar = {
      ...this.evento,
      fecha_realizacion: this.formatearFechaParaBackend(this.evento.fecha_realizacion)
    };

    console.log("Datos a actualizar:", datosParaEnviar);

    // Ejecutar el servicio de actualización
    this.eventosService.actualizarEvento(datosParaEnviar).subscribe(
      (response) => {
        console.log("Respuesta del servidor:", response);
        alert('Evento actualizado correctamente');
        this.router.navigate(['/eventos']);
      },
      (error) => {
        console.error('Error completo:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error response:', error.error);
        alert('Error al actualizar el evento: ' + (error.error?.message || error.message));
      }
    );
  }

  // Formatear fecha para el backend (YYYY-MM-DD)
  private formatearFechaParaBackend(fecha: any): string {
    if (!fecha) return '';

    let date: Date;
    if (typeof fecha === 'string') {
      date = new Date(fecha);
    } else {
      date = fecha;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Validar solo letras y números
  public soloLetrasNumeros(event: any) {
    const pattern = /[a-zA-Z0-9\s]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Validar solo números
  public soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Limitar caracteres en descripción
  public limitarCaracteres(event: any) {
    const maxLength = 300;
    if (event.target.value.length >= maxLength) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Ocultar programa educativo si no es para estudiantes
  public mostrarProgramaEducativo(): boolean {
    return this.evento.publico_objetivo === 'estudiantes';
  }
}
