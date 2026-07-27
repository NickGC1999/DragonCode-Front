import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta por defecto que redirige al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  {
    path: 'login',
    // Asumiendo que tu login también usa Lazy Loading, o puedes dejarlo normal
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'crear-cuenta',
    // MAGIA DE RENDIMIENTO: El navegador solo descarga este componente si el usuario entra a la ruta
    loadComponent: () => import('./crear-cuenta/crear-cuenta.component').then(m => m.CrearCuentaComponent)
  }
];