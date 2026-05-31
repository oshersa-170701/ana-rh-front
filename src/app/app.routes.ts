import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'reconocimiento-facial',
    loadComponent: () => import('./reconocimiento-facial/reconocimiento-facial.page').then(m => m.ReconocimientoFacialPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
 {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard],
    children: [
      {
  path: 'empleados-supervisor',
  loadComponent: () => import('./pages/admin/empleados-supervisor/empleados-supervisor.page').then(m => m.EmpleadosSupervisorPage),
  data: { title: 'Mi Personal', isHome: false }
},
      {
        path: '', 
        loadComponent: () => import('./pages/admin/home-admin/home-admin.page').then(m => m.HomeAdminPage),
        data: { title: 'Panel de Control', isHome: true }
      },
      {
        path: 'home-supervisor', // 👈 REGISTRADA AQUÍ COMO HIJA PROTEGIDA
        loadComponent: () => import('./pages/admin/home-supervisor/home-supervisor.page').then(m => m.HomeSupervisorPage),
        data: { title: 'Panel Supervisor', isHome: true }
      },
      {
        path: 'empresas',
        loadComponent: () => import('./pages/admin/empresas/empresas.page').then(m => m.EmpresasPage),
        data: { title: 'Gestión de Empresas', isHome: false }
      },
      {
        path: 'sucursales',
        loadComponent: () => import('./pages/admin/sucursales/sucursales.page').then(m => m.SucursalesPage),
        data: { title: 'Gestión de Sucursales', isHome: false }
      },
      {
        path: 'empleados',
        loadComponent: () => import('./pages/admin/empleados/empleados.page').then(m => m.EmpleadosPage),
        data: { title: 'Gestión de Empleados', isHome: false }
      }
      // ✨ ELIMINAMOS el { path: '', redirectTo: 'empresas' } que tenías aquí
    ]
  },
  {
    path: '',
    redirectTo: 'login', // Redirigimos al login por defecto al abrir la app de administración
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login'
  },
  {
    path: 'home-admin',
    loadComponent: () => import('./pages/admin/home-admin/home-admin.page').then( m => m.HomeAdminPage)
  },
  {
    path: 'home-supervisor',
    loadComponent: () => import('./pages/admin/home-supervisor/home-supervisor.page').then( m => m.HomeSupervisorPage)
  },
  {
    path: 'empleados-supervisor',
    loadComponent: () => import('./pages/admin/empleados-supervisor/empleados-supervisor.page').then( m => m.EmpleadosSupervisorPage)
  }
];