import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

// ─── MODELOS DE DATOS ───────────────────────────────────────────
interface Rune {
  symbol:   string;
  top:      string;
  left:     string;
  color:    string;
  delay:    string;
  duration: string;
  fontSize: string;
}

interface Avatar {
  id:   string;
  name: string;
  path: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-pantalla-principal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pantalla-principal.component.html',
  styleUrl:    './pantalla-principal.component.scss'
})
export class PantallaPrincipalComponent implements OnInit {

  private router = inject(Router);

  // ── ESTADO: Notificaciones ──────────────────────────────────────
  isNotifOpen = false;
  notifications: string[] = []; // Lista vacía para mostrar el mensaje de "sin notificaciones"

  // ── ESTADO: Modal Salir ─────────────────────────────────────────
  isLogoutModalOpen = false;

  // ── ESTADO: Runas de fondo (copiado del sistema del login) ──────
  runes: Rune[] = [];

  // ── ESTADO: Saludo dinámico ─────────────────────────────────────
  greetingMessage = '';

  // ── ESTADO: Avatar seleccionado (default: Drako Base) ───────────
  selectedAvatar = 'assets/images/tienda/avatares/drakobase.png';

  // ── ESTADO: Modal tienda ─────────────────────────────────────────
  isShopOpen = false;

  // ── ESTADO: Modal estrellas ──────────────────────────────────────
  isStarsModalOpen = false;
  
  // ── DATOS: Mundos y progreso de estrellas (Simulación) ─────────
  worldsProgress = Array.from({ length: 10 }, (_, i) => ({
    level: i + 1,
    name: `Mundo ${i + 1}`,
    stars: Math.floor(Math.random() * 4) // 0, 1, 2, o 3 estrellas aleatorias para probar
  }));

  // ── CATÁLOGO DE AVATARES ─────────────────────────────────────────
  avatars: Avatar[] = [
    { id: 'drakobase',     name: 'Drako Base',     path: 'assets/images/tienda/avatares/drakobase.png', price: 5, description: 'El clásico y confiable compañero de código.' },
    { id: 'drakoaprendiz', name: 'Drako Aprendiz', path: 'assets/images/tienda/avatares/drakoaprendiz.png', price: 5, description: 'Listo para absorber nuevos conocimientos.' },
    { id: 'drakocapa',     name: 'Drako Capa',     path: 'assets/images/tienda/avatares/drakocapa.png', price: 5, description: 'Elegancia mágica para tus sesiones.' },
    { id: 'drakochancla',  name: 'Drako Chancla',  path: 'assets/images/tienda/avatares/drakochancla.png', price: 5, description: 'Infalible para corregir bugs malcriados.' },
    { id: 'drakohaaland',  name: 'Drako Haaland',  path: 'assets/images/tienda/avatares/drakohaaland.png', price: 5, description: 'Una máquina de hacer goles en programación.' },
    { id: 'drakombappe',   name: 'Drako Mbappé',   path: 'assets/images/tienda/avatares/drakombappe.png', price: 5, description: 'Rapidez explosiva al compilar.' },
  ];

  // ── ESTADO: Confirmación de compra ───────────────────────────────
  isConfirmModalOpen = false;
  avatarToBuy: Avatar | null = null;

  // ── CICLO DE VIDA ────────────────────────────────────────────────
  ngOnInit(): void {
    this.generateRunes();
    this.setGreeting();
  }

  // ── LÓGICA: Generador de runas (idéntico al login) ───────────────
  private generateRunes(): void {
    // Mismos símbolos místicos/código que usa el login
    const symbols = ['{}', '[;]', '*', '01', '=>', '</>', '✧', '✦', 'Δ', '∇', 'Ω', '⎈', '≈', '⟁', '✧', '✦', 'Δ', 'Ω', '⎈'];
    const colors  = ['#D8BFD8', '#ADD8E6', '#FFB6C1', '#FFFFFF'];
    const numRunes = 45;

    for (let i = 0; i < numRunes; i++) {
      let randomTop  = Math.random() * 100;
      let randomLeft = Math.random() * 100;

      // Zona muerta en el centro para no tapar el contenido principal
      if (randomTop > 25 && randomTop < 75 && randomLeft > 25 && randomLeft < 75) {
        randomLeft = Math.random() > 0.5
          ? Math.random() * 20
          : 80 + Math.random() * 20;
      }

      this.runes.push({
        symbol:   symbols[Math.floor(Math.random() * symbols.length)],
        top:      randomTop  + '%',
        left:     randomLeft + '%',
        color:    colors[Math.floor(Math.random() * colors.length)],
        delay:    (Math.random() * 5)     + 's',
        duration: (Math.random() * 5 + 4) + 's',
        fontSize: (Math.floor(Math.random() * 6) + 10) + 'px',
      });
    }
  }

  // ── ESTADO: Imagen de fondo del panel saludo (depende de la hora) ──
  greetingBg = '';

  // ── LÓGICA: Saludo según hora (5 mensajes aleatorios por franja) ─
  private setGreeting(): void {
    const hour = new Date().getHours();

    const morning = [
      '¡Buenos días, Draco! ¿Listo para forjar código hoy?',
      '¡Despierta, Draco! El reino del código te espera.',
      '¡Los dragones madrugadores conquistan más reinos, Draco!',
      '¡Mañana de aventuras, Draco! ¿Qué misión atacamos hoy?',
      '¡Buenos días, valiente! El conocimiento aguarda tu llegada.',
    ];

    const afternoon = [
      '¡Buenas tardes, Draco! Sigue conquistando el código.',
      '¡Tarde productiva, Draco! Los dragones no descansan.',
      '¡Hola de nuevo, Draco! La tarde es perfecta para aprender.',
      '¡Sigue así, Draco! El código no se forja solo.',
      'Tarde a tarde, un paso más al dominio total, Draco.',
    ];

    const night = [
      '¡Buenas noches, Draco! Los mejores programadores trabajan de noche.',
      '¡Sesión nocturna, Draco! La oscuridad hace brillar el código.',
      'Los dragones nocturnos son los más legendarios, Draco.',
      '¡Un último reto antes de descansar, Draco!',
      'Las mejores ideas nacen bajo las estrellas, Draco.',
    ];

    let pool: string[];
    if      (hour >= 6  && hour < 12) {
      pool = morning;
      this.greetingBg = 'assets/images/pantallaprincipal/fondodia.png';
    } else if (hour >= 12 && hour < 19) {
      pool = afternoon;
      this.greetingBg = 'assets/images/pantallaprincipal/fondotarde.png';
    } else {
      pool = night;
      this.greetingBg = 'assets/images/pantallaprincipal/fondonoche.png';
    }

    this.greetingMessage = pool[Math.floor(Math.random() * pool.length)];
  }


  // ── MODAL: Tienda ───────────────────────────────────────────────
  openShop(): void {
    this.isShopOpen = true;
  }

  closeShop(): void {
    this.isShopOpen = false;
    this.isConfirmModalOpen = false;
    this.avatarToBuy = null;
  }

  // Al hacer clic en un avatar en la tienda
  selectAvatar(avatar: Avatar): void {
    // Si ya lo tiene equipado, no hace nada (o podríamos poner otra lógica futura)
    if (this.selectedAvatar === avatar.path) return;
    
    this.avatarToBuy = avatar;
    this.isConfirmModalOpen = true;
  }
  
  confirmPurchase(): void {
    if (this.avatarToBuy) {
      this.selectedAvatar = this.avatarToBuy.path;
      // Aquí en el futuro se restarían las estrellas
    }
    this.isConfirmModalOpen = false;
    this.avatarToBuy = null;
  }

  cancelPurchase(): void {
    this.isConfirmModalOpen = false;
    this.avatarToBuy = null;
  }

  openStarsModal(): void {
    this.isStarsModalOpen = true;
  }

  closeStarsModal(): void {
    this.isStarsModalOpen = false;
  }

  // ── ACCIONES: Notificaciones ─────────────────────────────────────
  toggleNotif(): void {
    this.isNotifOpen = !this.isNotifOpen;
  }
  closeNotif(): void {
    this.isNotifOpen = false;
  }
  markAllAsRead(): void {
    this.notifications = [];
  }

  // ── ACCIONES: Salir ──────────────────────────────────────────────
  openLogout(): void {
    this.isLogoutModalOpen = true;
  }
  closeLogout(): void {
    this.isLogoutModalOpen = false;
  }
  confirmLogout(): void {
    this.isLogoutModalOpen = false;
    this.router.navigate(['/login']);
  }
}
