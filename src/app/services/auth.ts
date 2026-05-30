import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Ajusta la URL según la configuración de tu servidor NestJS
 private apiUrl = 'http://localhost:3000/usuarios/login'; // 👈 Cambiado de /auth/login a /usuarios/login
private inactivityTimer: any;
  private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos en ms
  constructor(private http: HttpClient,private router: Router) {}

  login(user: string, password_hash: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { user, password_hash }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_user', user);
        }
      })
    );
  }

  // Borra todo rastro de la sesión
  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.stopInactivityTimer();
    this.router.navigate(['/login']);
  }

  // Reinicia el temporizador cada vez que el usuario interactúa
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
}