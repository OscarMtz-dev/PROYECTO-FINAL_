import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public admin:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    //El primer if valida si existe un parámetro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista asignamos los datos del user
      this.admin = this.datos_user;
    }else{
      // Va a registrar un nuevo administrador
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    //Imprimir datos en consola
    console.log("Admin: ", this.admin);
  }

  //Funciones para password
  public showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    //Validar la contraseña
    if(this.admin.password == this.admin.confirmar_password){
      // Ejecutamos el servicio de registro
      this.administradoresService.registrarAdministrador(this.admin).subscribe(
        (response) => {
          // Redirigir o mostrar mensaje de éxito
          alert("Administrador registrado exitosamente");
          console.log("Administrador registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["administrador"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          // Manejar errores de la API
          alert("Error al registrar administrador");
          console.error("Error al registrar administrador: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
    }
  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Ejecutar el servicio de actualización
    this.administradoresService.actualizarAdmin(this.admin).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Administrador actualizado exitosamente");
        console.log("Administrador actualizado: ", response);
        this.router.navigate(["administrador"]);
      },
      (error) => {
        // Manejar errores de la API
        alert("Error al actualizar administrador");
        console.error("Error al actualizar administrador: ", error);
      }
    );

  }

  soloAlfanumerico(event: KeyboardEvent) {
  const pattern = /^[a-zA-Z0-9]$/; // Solo letras y números
  const inputChar = event.key;

  if (!pattern.test(inputChar) && event.key !== 'Backspace' && event.key !== 'Tab') {
    event.preventDefault();
  }
}

  public validarEstructuraRFC(event: KeyboardEvent) {
  const inputChar = event.key.toUpperCase();
  const currentValue = (this.admin.rfc || "").toUpperCase();
  const pos = currentValue.length;

  // Permitir teclas de control
  if (event.ctrlKey || event.altKey || event.metaKey || inputChar.length > 1) return;

  // Permitir borrar, tabular o moverse
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (allowedKeys.includes(event.key)) return;

  let regex: RegExp | null = null;

  // RFC puede ser de 12 (persona moral) o 13 (física)
  // Validamos según la posición actual
  if (pos >= 0 && pos <= 2) regex = /^[A-Z]$/;            // Letras iniciales
  else if (pos === 3) regex = /^[A-Z0-9]$/;               // 4ta posición (puede ser letra o número)
  else if (pos >= 4 && pos <= 9) regex = /^[0-9]$/;       // Fecha AAMMDD
  else if (pos >= 10 && pos <= 12) regex = /^[A-Z0-9]$/;  // Homoclave (3 últimos)
  else event.preventDefault();                            // Evita más de 13 caracteres

  // Validar carácter ingresado
  if (regex && !regex.test(inputChar)) {
    event.preventDefault();
  }
}

  // Función para los campos solo de datos alfabeticos
  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}

