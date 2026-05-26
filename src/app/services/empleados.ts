import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpleadoIdentificado } from '../models1/empleado.interface';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {
  // Ajusta esta URL si tu servidor de NestJS corre en otro puerto (generalmente es el 3000)
  private apiUrl = 'http://localhost:3000/empleados';

  constructor(private http: HttpClient) { }

  crearEmpleado(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
  reconocer(descriptor: number[]): Observable<EmpleadoIdentificado> {
    return this.http.post<EmpleadoIdentificado>(`${this.apiUrl}/reconocer`, { descriptor });
  }

}