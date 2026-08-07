import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TarjetaConfig {
  texto: string;
  color: string;
  accion: string;
}

@Component({
  selector: 'app-baraja-tarjetas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './baraja-tarjetas.component.html',
  styleUrl: './baraja-tarjetas.component.scss'
})
export class BarajaTarjetasComponent {
  @Input() configuracion: TarjetaConfig[] = [];
  
  // Ahora emitimos el objeto completo para que el Layout sepa el color
  @Output() instruccionSeleccionada = new EventEmitter<TarjetaConfig>();

  mostrarObjetos: boolean = true;
  animandoOla: boolean = false;
  bloquearBoton: boolean = false;
  tabActiva: 'acciones' | 'objetos' = 'acciones';

  setTab(tab: 'acciones' | 'objetos') {
    this.tabActiva = tab;
  }

  seleccionarTarjeta(tarjeta: TarjetaConfig) {
    this.instruccionSeleccionada.emit(tarjeta);
  }

  toggleObjetos() {
    // Medida de seguridad: Si está animando, bloquea el spam de clicks
    if (this.bloquearBoton) return;
    this.bloquearBoton = true;

    if (this.mostrarObjetos) {
      // 1. Inicia el cierre del cajón (el CSS toma 0.3s)
      this.mostrarObjetos = false;

      // 2. Tan pronto como el cajón termina de cerrar (300ms), inicia la ola
      setTimeout(() => {
        this.animandoOla = true;
      }, 300);

      // 3. Limpieza final y desbloqueo del botón
      setTimeout(() => {
        this.animandoOla = false;
        this.bloquearBoton = false;
      }, 1300); // 300ms (cierre) + 1000ms (animación de ola)

    } else {
      // Flujo de apertura: cajón se abre y tarjetas se reacomodan en ola
      this.mostrarObjetos = true;
      this.animandoOla = true;
      
      setTimeout(() => {
        this.animandoOla = false;
        this.bloquearBoton = false;
      }, 1000);
    }
  }
}
