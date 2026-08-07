import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsolaCodigoComponent } from '../consola-codigo/consola-codigo.component';
import { BarajaTarjetasComponent, TarjetaConfig } from '../baraja-tarjetas/baraja-tarjetas.component';
import { NotificationService } from '../services/notification.service';
import { GameHeaderComponent } from '../game-header/game-header.component';

export interface Instruccion {
  texto: string;
  color: string;
  tieneError: boolean;
}

@Component({
  selector: 'app-layout-juego',
  standalone: true,
  imports: [CommonModule, ConsolaCodigoComponent, BarajaTarjetasComponent, GameHeaderComponent],
  templateUrl: './layout-juego.component.html',
  styleUrl: './layout-juego.component.scss'
})
export class LayoutJuegoComponent {
  // Estado centralizado: Inicializado con una línea por defecto
  lineasCodigo: Instruccion[] = [{ texto: '', color: '#d4d4d4', tieneError: false }];
  
  // Estado de ejecución
  ejecutando: boolean = false;

  // Servicio de Notificaciones
  private notificationService = inject(NotificationService);

  // Referencia a la consola hija
  @ViewChild(ConsolaCodigoComponent) consola!: ConsolaCodigoComponent;

  // Configuración de las tarjetas recibida desde el "Cartucho"
  @Input() configuracionTarjetas: TarjetaConfig[] = [];

  // Método accionado por la Baraja para agregar código
  agregarCodigo(tarjeta: TarjetaConfig) {
    if (this.consola) {
      this.consola.insertarDesdeTarjeta(tarjeta);
    }
  }

  // Método accionado por la Consola cuando el usuario borra una línea completa
  eliminarLinea(index: number) {
    this.lineasCodigo.splice(index, 1);
    this.verificarLineaMinima();
  }

  // Toolbar: Borrar última línea
  borrarUltimaLinea() {
    if (this.lineasCodigo.length > 0) {
      this.lineasCodigo.pop();
    }
    this.verificarLineaMinima();
  }

  // Toolbar: Limpiar Todo
  limpiarTodo() {
    this.lineasCodigo = [{ texto: '', color: '#d4d4d4', tieneError: false }];
  }

  // Toolbar: Ejecutar
  ejecutarCodigo() {
    const hayErrores = this.lineasCodigo.some(linea => linea.tieneError);
    const estaVacio = this.lineasCodigo.every(linea => linea.texto.trim() === '');

    if (hayErrores || estaVacio) {
      const mensaje = hayErrores 
        ? 'Hay errores de sintaxis en tu código mágico.'
        : 'No has escrito ningún código mágico para ejecutar.';
      this.notificationService.show(mensaje, 'error');
      return;
    }

    this.ejecutando = true;
    console.log('Ejecutando código...', this.lineasCodigo);
    // Simulación de fin de ejecución tras 2 segundos
    setTimeout(() => this.ejecutando = false, 2000);
  }

  // Utilidad: Asegurar que nunca quede en 0 líneas
  private verificarLineaMinima() {
    if (this.lineasCodigo.length === 0) {
      this.lineasCodigo.push({ texto: '', color: '#d4d4d4', tieneError: false });
    }
  }

  abandonarPartida() {
    // Aquí puedes integrar la lógica de enrutamiento con el Router de Angular
    // para volver al mapa principal: this.router.navigate(['/mapa']);
    console.log("Abandonando misión... Redirigiendo al mapa.");
  }
}
