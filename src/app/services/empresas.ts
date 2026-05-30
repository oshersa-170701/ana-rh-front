import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Interfaz rápida para tipar tu entidad Empresa tal cual la tienes en NestJS
export interface Empresa {
  id?: string;
  nombre: string;
  rfc: string;
  estatus?: boolean;
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class Empresas {
  // Asegúrate de tener tu URL base en el environment (ej: http://localhost:3000)
    private apiUrl = 'http://localhost:3000/empresas';


  constructor(private http: HttpClient) {}

  // Obtener todas las empresas
  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  // Obtener una sola empresa por su UUID
  getEmpresaById(id: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva empresa (usa tu CreateEmpresaDto del backend)
  createEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  // Actualizar una empresa por su UUID (usa tu UpdateEmpresaDto)
  updateEmpresa(id: string, empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.apiUrl}/${id}`, empresa);
  }

  // Eliminar una empresa
  deleteEmpresa(id: string): Observable<Empresa> {
    return this.http.delete<Empresa>(`${this.apiUrl}/${id}`);
  }
}