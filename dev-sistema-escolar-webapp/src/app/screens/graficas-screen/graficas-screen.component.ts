import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { GraficasService } from 'src/app/services/graficas.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  public total_user: any = {};
  public cargando: boolean = true;

  // Gráfica de Barras
  public barChartData: any = {};
  public barChartOption = { responsive: true }
  public barChartPlugins = [DatalabelsPlugin];

  // Gráfica de Línea
  public lineChartData: any = {};
  public lineChartOption = { responsive: true }
  public lineChartPlugins = [DatalabelsPlugin];

  // Gráfica Circular
  public pieChartData: any = {};
  public pieChartOption = { responsive: true }
  public pieChartPlugins = [DatalabelsPlugin];

  // Gráfica Doughnut
  public doughnutChartData: any = {};
  public doughnutChartOption = { responsive: true }
  public doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private graficasService: GraficasService
  ) { }

  ngOnInit(): void {
    this.obtenerDatosUsuarios();
  }

  public obtenerDatosUsuarios() {
    this.cargando = true;

    this.graficasService.obtenerTotalesUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        this.crearGraficas(); // Crear gráficas con datos reales
        this.cargando = false;
      },
      (error) => {
        console.error('Error:', error);
        // Datos de ejemplo si hay error
        this.total_user = { admins: 1, maestros: 2, alumnos: 3 };
        this.crearGraficas();
        this.cargando = false;
      }
    );
  }

  private crearGraficas() {
    const admins = this.total_user.admins || 0;
    const maestros = this.total_user.maestros || 0;
    const alumnos = this.total_user.alumnos || 0;

    // Gráfica de Barras
    this.barChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [{
        data: [admins, maestros, alumnos],
        label: 'Total de Usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#82D3FB']
      }]
    };

    // Gráfica de Línea
    this.lineChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [{
        data: [admins, maestros, alumnos],
        label: 'Total de Usuarios',
        borderColor: '#F88406',
        backgroundColor: 'rgba(248, 132, 6, 0.2)'
      }]
    };

    // Gráfica Circular
    this.pieChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [{
        data: [admins, maestros, alumnos],
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
      }]
    };

    // Gráfica Doughnut
    this.doughnutChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [{
        data: [admins, maestros, alumnos],
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
      }]
    };
  }
}
