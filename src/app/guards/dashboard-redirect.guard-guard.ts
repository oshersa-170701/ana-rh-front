import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const dashboardRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = authService.getUserRole();

  if (authService.isLoggedIn()) {
    // 🏢 Si es supervisor, lo mandamos directo a su home de supervisor
    if (role === 'admin_sucursal') {
      router.navigate(['/dashboard/home-supervisor']);
      return false;
    }
    // 👑 Si es superadmin, permitimos que pase al home-admin original (devuelve true)
    if (role === 'superadmin') {
      return true;
    }
  }

  router.navigate(['/login']);
  return false;
};