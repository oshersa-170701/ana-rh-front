import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'reconocimiento-facial',
    loadComponent: () => import('./reconocimiento-facial/reconocimiento-facial.page').then( m => m.ReconocimientoFacialPage)
  },
];
