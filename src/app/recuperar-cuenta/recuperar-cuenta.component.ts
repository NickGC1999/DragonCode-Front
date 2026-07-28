import { Component } from '@angular/core';
import { CyberLayoutComponent } from '../cyber-layout/cyber-layout.component';

@Component({
  selector: 'app-recuperar-cuenta',
  standalone: true,
  imports: [CyberLayoutComponent], // El cascarón que envuelve al formulario
  templateUrl: './recuperar-cuenta.component.html',
  styleUrl: './recuperar-cuenta.component.scss'
})
export class RecuperarCuentaComponent {}
