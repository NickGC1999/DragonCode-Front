import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent], // Importamos tu componente encapsulado
  template: '<app-login></app-login>', // Renderizamos directamente tu login aquí
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Archivo limpio. Delegamos toda la responsabilidad gráfica al hijo.
}