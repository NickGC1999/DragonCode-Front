import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html', // Shell con router-outlet + footer global + toast
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Archivo limpio. El router decide qué pantalla renderizar.
}