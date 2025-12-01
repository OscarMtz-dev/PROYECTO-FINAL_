import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-evento-modal',
  templateUrl: './editar-evento-modal.component.html',
  styleUrls: ['./editar-evento-modal.component.scss']
})
export class EditarEventoModalComponent implements OnInit {

  public nombre_evento: string = "";

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<EditarEventoModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.nombre_evento = this.data.nombre;
  }

  public cerrar_modal(){
    this.dialogRef.close({isEdit:false});
  }

  public editarEvento(){
    // Redirigir a la pantalla de edición de eventos
    this.dialogRef.close({isEdit:true});
    this.router.navigate([`registro-eventos/${this.data.id}`]);
  }
}
