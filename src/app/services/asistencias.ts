import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface AsistenciaResponse {
  id: string;
  tenant_id: string;
  empleado_id: string;
  fecha: string;
  tipo_evento: 'ENTRADA' | 'INICIO_ALMUERZO' | 'FIN_ALMUERZO' | 'SALIDA';
  hora: string;
  metodo_validacion: string; 
  score_confianza_ia?: number;
  created_at: string;
  empleado?: {
    nombre_completo: string;
    puesto: string;
    foto_perfil_url?: string; // 👈 ✨ AGREGA ESTA LÍNEA DE ORO
  };
}
@Injectable({
  providedIn: 'root'
})
export class AsistenciasService {
  private apiUrl = 'http://localhost:3000/asistencias';

  constructor(private http: HttpClient) { }

  // 🏢 Obtiene las asistencias filtradas de forma segura por Empresa y Sucursal
  getAsistenciasPorSucursal(tenantId: string, sucursalId: string): Observable<AsistenciaResponse[]> {
    return this.http.get<AsistenciaResponse[]>(`${this.apiUrl}/sucursal/${tenantId}/${sucursalId}`);
  }
}