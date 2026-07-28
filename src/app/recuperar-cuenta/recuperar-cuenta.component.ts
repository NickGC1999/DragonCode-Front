import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CyberLayoutComponent } from '../cyber-layout/cyber-layout.component';

@Component({
  selector: 'app-recuperar-cuenta',
  standalone: true,
  imports: [CyberLayoutComponent, RouterLink],
  templateUrl: './recuperar-cuenta.component.html',
  styleUrl: './recuperar-cuenta.component.scss'
})
export class RecuperarCuentaComponent {}

