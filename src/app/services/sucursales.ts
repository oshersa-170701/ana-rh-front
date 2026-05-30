import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Sucursal {
  id?: string;
  tenant_id: string;
  nombre: string;
  direccion?: string;
  created_at?: Date;
  empresa?: {
    id: string;
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
   private apiUrl = 'http://localhost:3000/sucursales';

  constructor(private http: HttpClient) {}

  getSucursales(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.apiUrl);
  }

  getSucursalById(id: string): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.apiUrl}/${id}`);
  }

  createSucursal(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.apiUrl, sucursal);
  }

  updateSucursal(id: string, sucursal: Partial<Sucursal>): Observable<Sucursal> {
    return this.http.patch<Sucursal>(`${this.apiUrl}/${id}`, sucursal);
  }

  deleteSucursal(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}