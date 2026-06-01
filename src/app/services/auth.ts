import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // 🚀 Endpoints independientes para cada tipo de cuenta
  private superadminUrl = 'http://localhost:3000/usuarios/login'; 
  private empleadoUrl = 'http://localhost:3000/empleados/login'; // 👈 Nuestro nuevo endpoint

  private inactivityTimer: any;
  private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos

  constructor(private http: HttpClient, private router: Router) {}

  // ✨ Intento de login para Superadmin
  loginSuperadmin(user: string, password_hash: string): Observable<any> {
    return this.http.post<any>(this.superadminUrl, { user, password_hash }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_user', user);
          localStorage.setItem('admin_role', 'superadmin'); // 👈 Guardamos el rol
        }
      })
    );
  }

  // ✨ Intento de login para Administrador de Sucursal (Tabla Empleados)
 loginEmpleadoAdmin(user: string, password_hash: string): Observable<any> {
    return this.http.post<any>(this.empleadoUrl, { user, password_hash }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_user', res.nombre_completo || user);
          localStorage.setItem('admin_user_id', res.id); 
          localStorage.setItem('admin_role', 'admin_sucursal');
          localStorage.setItem('admin_tenant_id', res.tenant_id);
          localStorage.setItem('admin_sucursal_id', res.sucursal_id);
          
          // ✨ NUEVO: Guardamos los nombres descriptivos en el almacenamiento local
          localStorage.setItem('admin_empresa_nombre', res.empresa_nombre);
          localStorage.setItem('admin_sucursal_nombre', res.sucursal_nombre);
        }
      })
    );
  }
logout() {
    // 🧹 Limpieza absoluta de todas las llaves de ANA Medic
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_user_id');
    localStorage.removeItem('admin_tenant_id');
    localStorage.removeItem('admin_sucursal_id');
    localStorage.removeItem('admin_empresa_nombre');
    localStorage.removeItem('admin_sucursal_nombre');
    localStorage.removeItem('admin_user_username'); // Por si acaso

    this.stopInactivityTimer();
    
    // Redirigimos estrictamente a la pantalla de login limpia
    this.router.navigate(['/login']);
  }
  resetInactivityTimer() {
    this.stopInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      console.warn("Sesión expirada por inactividad");
      this.logout();
    }, this.SESSION_TIMEOUT);
  }

  private stopInactivityTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  // Métodos auxiliares para saber quién está logueado en el sistema
  getUserRole(): string | null {
    return localStorage.getItem('admin_role');
  }

  getSucursalId(): string | null {
    return localStorage.getItem('admin_sucursal_id');
  }
}