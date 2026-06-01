import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// 🛡️ CONTROL 1: Exclusivo para rutas de Super Admin (/dashboard, /empresas, etc.)
export const superadminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.getUserRole() === 'superadmin') {
    return true;
  }

  // Si no es superadmin, lo sacamos al login y limpiamos rastros
  console.warn('Acceso denegado: Se requería rol Superadmin');
  authService.logout();
  return false;
};

// 🛡️ CONTROL 2: Exclusivo para rutas del Supervisor de Sucursal (/personal-sucursal, etc.)
export const supervisorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.getUserRole() === 'admin_sucursal') {
    return true;
  }

  // Si no es supervisor de sucursal, revocamos y mandamos al login
  console.warn('Acceso denegado: Se requería rol Administrador de Sucursal');
  authService.logout();
  return false;
};