import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-user-modal',
  templateUrl: './editar-user-modal.component.html',
  styleUrls: ['./editar-user-modal.component.scss']
})
export class EditarUserModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<EditarUserModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  public cerrar_modal(){
    this.dialogRef.close({isEdit:false});
  }

  public editarUser(){
    // Redirigir a la pantalla de edición
    this.dialogRef.close({isEdit:true});
    this.router.navigate([`registro-usuarios/${this.rol}/${this.data.id}`]);
  }
}
