import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpleadoIdentificado } from '../models1/empleado.interface';

// Definimos la interfaz local para el tipado de la tabla y las relaciones
export interface Empleado {
  id?: string;
  tenant_id: string;
  sucursal_id: string;
  nombre_completo: string;
  curp: string;
  nss?: string;
  salario_diario: number;
  puesto: string;
  foto_perfil_url?: string;
  face_embedding?: string;
  estatus: number; // 1: Activo, 0: Inactivo
  created_at?: Date;
  empresa?: { nombre: string };
  sucursal?: { nombre: string };
  user?: string | null; // 👈 Nombre de usuario para el login de sistema
}

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {
  private apiUrl = 'http://localhost:3000/empleados';

  constructor(private http: HttpClient) { }

  // ✨ Trae todos los empleados (con sus relaciones cargadas desde NestJS)
  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  // ✨ Trae un solo empleado por su UUID
  getEmpleadoById(id: string): Observable<Empleado> {
    return this.http.get<Empleado>(`${`${this.apiUrl}/${id}`}`);
  }

  // 🚀 Tu método original: Envía FormData (Campos + Archivo de Imagen)
  crearEmpleado(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // 🔄 Actualiza al empleado. Nota: Si mandas imagen nueva usas FormData, si solo editas texto un objeto Partial<Empleado>
  updateEmpleado(id: string, data: any): Observable<any> {
    return this.http.patch(`${`${this.apiUrl}/${id}`}`, data);
  }

  // ❌ Elimina al empleado permanentemente
  deleteEmpleado(id: string): Observable<any> {
    return this.http.delete(`${`${this.apiUrl}/${id}`}`);
  }

  // 🤖 Tu método original de reconocimiento facial
  reconocer(descriptor: number[]): Observable<EmpleadoIdentificado> {
    return this.http.post<EmpleadoIdentificado>(`${`${this.apiUrl}/reconocer`}`, { descriptor });
  }
  getSucursalesByTenant(tenantId: string): Observable<any[]> {
  // Cambia este endpoint según cómo tengas nombrada tu ruta de sucursales en NestJS
  return this.http.get<any[]>(`http://localhost:3000/sucursales/tenant/${tenantId}`);
}
}