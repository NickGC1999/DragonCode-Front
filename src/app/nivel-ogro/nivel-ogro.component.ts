import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutJuegoComponent } from '../layout-juego/layout-juego.component';
import { TarjetaConfig } from '../baraja-tarjetas/baraja-tarjetas.component';

@Component({
  selector: 'app-nivel-ogro',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutJuegoComponent],
  templateUrl: './nivel-ogro.component.html',
  styleUrl: './nivel-ogro.component.scss'
})
export class NivelOgroComponent {
  
  // Cartucho de configuración para el nivel del Ogro
  configTarjetasOgro: TarjetaConfig[] = [
    { texto: 'Arriba', color: '#569CD6', accion: 'ogro.caminarArriba()' },
    { texto: 'Abajo', color: '#6A9955', accion: 'ogro.caminarAbajo()' },
    { texto: 'Izquierda', color: '#CE9178', accion: 'ogro.caminarIzquierda()' },
    { texto: 'Derecha', color: '#C586C0', accion: 'ogro.caminarDerecha()' }
  ];

}
