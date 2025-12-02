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
    // Verificar permisos 
    const userGroup = this.facadeService.getUserGroup();
    if (userGroup !== 'administrador') {
      alert('No tienes permisos para acceder a esta función');
      this.router.navigate(['/home']);
      return;
    }

    
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);

      setTimeout(() => {
        this.evento = this.datos_evento;
        console.log("Evento después de timeout: ", this.evento);
        this.cargarResponsables();
      }, 100);

    }else{

      this.evento = this.eventosService.esquemaEvento();
      this.token = this.facadeService.getSessionToken();
      this.cargarResponsables();
    }

    console.log("Evento inicial: ", this.evento);
  }


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

    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }


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
 
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if(Object.keys(this.errors).length > 0){
      console.log("Errores de validación:", this.errors);
      return false;
    }


    const datosParaEnviar = {
      ...this.evento,
      fecha_realizacion: this.formatearFechaParaBackend(this.evento.fecha_realizacion)
    };

    console.log("Datos a actualizar:", datosParaEnviar);


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


  public soloLetrasNumeros(event: any) {
    const pattern = /[a-zA-Z0-9\s]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }


  public soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }


  public limitarCaracteres(event: any) {
    const maxLength = 300;
    if (event.target.value.length >= maxLength) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  public mostrarProgramaEducativo(): boolean {
    return this.evento.publico_objetivo === 'estudiantes';
  }
}
