import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from '../../services/eventos.service';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  public tipo:string = "registro-eventos";
  public evento:any = {}; // ← USAR "evento" COMO EN MAESTROS USAN "user"
  public editar:boolean = false;
  public idEvento:number = 0;
  public isEvento:boolean = true;

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    //El if valida si existe un parámetro ID en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);
      //Al iniciar la vista obtiene el evento por su ID
      this.obtenerEventoByID();
    }
  }

  //Obtener evento por ID
  public obtenerEventoByID() {
    console.log("Obteniendo evento con ID: ", this.idEvento);

    this.eventosService.obtenerEventoPorID(this.idEvento).subscribe(
      (response) => {
        this.evento = response; // ← ASIGNAR A "evento" COMO EN MAESTROS
        console.log("Evento obtenido: ", this.evento);
      }, (error) => {
        console.log("Error: ", error);
        alert("No se pudo obtener el evento seleccionado");
      }
    );
  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
