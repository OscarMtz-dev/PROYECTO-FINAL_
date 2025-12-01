import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

@Injectable({
  providedIn: 'root'
})
export class GraficasService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) { }

  public obtenerTotalesUsuarios(): Observable<any> {
    const token = this.facadeService.getSessionToken();

    // VERIFICAR QUE EL TOKEN EXISTA
    if (!token) {
      console.error('No hay token de autenticación');
      // Puedes redirigir al login o manejar el error
      this.facadeService.logout();
      return new Observable();
    }

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Authorization', 'Bearer ' + token); // ← TOKEN CORRECTO

    console.log("Token enviado:", token); // Para debug

    return this.http.get<any>(`${environment.url_api}/total-usuarios/`, { headers });
  }
}
