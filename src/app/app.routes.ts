import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta por defecto que redirige al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'crear-cuenta',
    loadComponent: () => import('./crear-cuenta/crear-cuenta.component').then(m => m.CrearCuentaComponent)
  },
  {
    path: 'recuperar-cuenta',
    loadComponent: () => import('./recuperar-cuenta/recuperar-cuenta.component').then(m => m.RecuperarCuentaComponent)
  },
  {
    path: 'cambiar-contrasena',
    loadComponent: () => import('./cambiar-contrasena/cambiar-contrasena.component').then(m => m.CambiarContrasenaComponent)
  },
  {
    path: 'pantalla-principal',
    loadComponent: () => import('./pantalla-principal/pantalla-principal.component').then(m => m.PantallaPrincipalComponent)
  }
];