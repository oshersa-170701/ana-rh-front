import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IncidenciaPayload {
  tenant_id: string;
  empleado_id: string;
  tipo: 'FALTA' | 'RETARDO' | 'HORA_EXTRA' | 'PERMISO' | 'VACACIONES';
  fecha: string;
  cantidad_horas?: number;
  motivo: string;
  estatus?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  aprobado_por?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {
  private apiUrl = 'http://localhost:3000/incidencias';

  constructor(private http: HttpClient) { }

  // 🚀 Registra la nueva incidencia propuesta por el supervisor
  crearIncidencia(payload: IncidenciaPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
  getIncidenciasPorSucursal(tenantId: string, sucursalId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sucursal/${tenantId}/${sucursalId}`);
  }
}