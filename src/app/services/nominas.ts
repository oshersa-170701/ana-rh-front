import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NominaResponse } from '../models1/nomina.interface';

@Injectable({
  providedIn: 'root'
})
export class NominasService {
  // Ruta de tu API local en NestJS
  private apiUrl = 'http://localhost:3000/nominas';

  constructor(private http: HttpClient) { }

  /**
   * 📅 Recupera el historial de períodos de nómina filtrado por la empresa (Tenant)
   * @param tenantId UUID de la empresa actual
   */
  getNominasPorTenant(tenantId: string): Observable<NominaResponse[]> {
    const params = new HttpParams().set('tenant_id', tenantId);
    return this.http.get<NominaResponse[]>(this.apiUrl, { params });
  }

  /**
   * 🔍 Trae el desglose completo y congelado de sueldos de una nómina específica
   * Incluye el arreglo relacional 'detalles' con la info de cada empleado
   * @param id UUID de la nómina a consultar
   */
  getDetalleNomina(id: string): Observable<NominaResponse> {
    return this.http.get<NominaResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * 🚀 Registra y dispara la generación en cascada de una nueva nómina
   * @param payload Objeto con tenant_id, periodo_inicio y periodo_fin
   */
  crearNomina(payload: { tenant_id: string; periodo_inicio: string; periodo_fin: string }): Observable<NominaResponse> {
    return this.http.post<NominaResponse>(this.apiUrl, payload);
  }
  cambiarEstatusNomina(id: string, estatus: string): Observable<NominaResponse> {
    return this.http.patch<NominaResponse>(`${this.apiUrl}/${id}/estatus`, { estatus });
  }
}