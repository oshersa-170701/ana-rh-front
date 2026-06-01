import { Routes } from '@angular/router';
import { superadminGuard, supervisorGuard } from './guards/auth-guard';
import { dashboardRedirectGuard } from './guards/dashboard-redirect.guard-guard';
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  // 🤖 ✨ RUTA RESTAURADA: Libre de guards para que la tablet/kiosco pueda escanear rostros de inmediato
  {
    path: 'reconocimiento-facial',
    loadComponent: () => import('./reconocimiento-facial/reconocimiento-facial.page').then(m => m.ReconocimientoFacialPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    children: [
      // 🛡️ RUTAS EXCLUSIVAS DEL SUPERVISOR DE SUCURSAL
      {
        path: 'empleados-supervisor',
        loadComponent: () => import('./pages/admin/empleados-supervisor/empleados-supervisor.page').then(m => m.EmpleadosSupervisorPage),
        canActivate: [supervisorGuard], // 👈 Solo entra el supervisor
        data: { title: 'Mi Personal', isHome: false }
      },
      {
        path: 'home-supervisor',
        loadComponent: () => import('./pages/admin/home-supervisor/home-supervisor.page').then(m => m.HomeSupervisorPage),
        canActivate: [supervisorGuard], // 👈 Solo entra el supervisor
        data: { title: 'Panel Supervisor', isHome: true }
      },

      // 🛡️ RUTAS EXCLUSIVAS DEL SUPER ADMIN
      {
        path: 'empresas',
        loadComponent: () => import('./pages/admin/empresas/empresas.page').then(m => m.EmpresasPage),
        canActivate: [superadminGuard], // 👈 Solo entra el superadmin
        data: { title: 'Gestión de Empresas', isHome: false }
      },
      {
        path: 'sucursales',
        loadComponent: () => import('./pages/admin/sucursales/sucursales.page').then(m => m.SucursalesPage),
        canActivate: [superadminGuard], // 👈 Solo entra el superadmin
        data: { title: 'Gestión de Sucursales', isHome: false }
      },
      {
        path: 'empleados',
        loadComponent: () => import('./pages/admin/empleados/empleados.page').then(m => m.EmpleadosPage),
        canActivate: [superadminGuard], // 👈 Solo entra el superadmin
        data: { title: 'Gestión de Empleados', isHome: false }
      },

      // 🔄 RUTA DE REDIRECCIÓN INTELIGENTE AL ENTRAR AL PARENT PATH
      {
        path: '', 
        loadComponent: () => import('./pages/admin/home-admin/home-admin.page').then(m => m.HomeAdminPage),
        canActivate: [dashboardRedirectGuard], // 🔥 Desvía al supervisor a su panel y deja pasar al superadmin
        data: { title: 'Panel de Control', isHome: true }
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];