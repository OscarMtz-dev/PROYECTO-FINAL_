import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-eliminar-evento-modal',
  templateUrl: './eliminar-evento-modal.component.html',
  styleUrls: ['./eliminar-evento-modal.component.scss']
})
export class EliminarEventoModalComponent implements OnInit {

  public nombre_evento: string = "";

  constructor(
    private eventosService: EventosService,
    private dialogRef: MatDialogRef<EliminarEventoModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.nombre_evento = this.data.nombre;
  }

  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }

  public eliminarEvento(){
    this.eventosService.eliminarEvento(this.data.id).subscribe(
      (response)=>{
        console.log(response);
        this.dialogRef.close({isDelete:true});
      }, (error)=>{
        console.error("Error al eliminar evento:", error);
        this.dialogRef.close({isDelete:false});
      }
    );
  }
}
