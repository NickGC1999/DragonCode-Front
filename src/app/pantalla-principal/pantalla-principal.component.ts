import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilComponent } from '../perfil/perfil.component';
import { TiendaComponent } from '../tienda/tienda.component';
import { NotificationService } from '../services/notification.service';
import { UserService, UserProfile } from '../services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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


@Component({
  selector: 'app-pantalla-principal',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, PerfilComponent, TiendaComponent],
  templateUrl: './pantalla-principal.component.html',
  styleUrl:    './pantalla-principal.component.scss'
})
export class PantallaPrincipalComponent implements OnInit {

  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  // ── ESTADO: Perfil Usuario (State Management) ───────────────────
  userProfile$!: Observable<UserProfile>;

  // ── ESTADO: Notificaciones ──────────────────────────────────────
  isNotifOpen = false;
  notifications: string[] = []; // Lista vacía para mostrar el mensaje de "sin notificaciones"

  // ── ESTADO: Modal Salir ─────────────────────────────────────────
  isLogoutModalOpen = false;

  // ── ESTADO: Runas de fondo (copiado del sistema del login) ──────
  runes: Rune[] = [];

  // ── ESTADO: Saludo dinámico ─────────────────────────────────────
  greetingTemplate = '';
  greetingMessage$!: Observable<string>;

  // ── ESTADO: Avatar seleccionado (default: Drako Base) ───────────
  selectedAvatar = 'assets/images/tienda/avatares/drakobase.png';

  // ── ESTADO: Modal tienda ─────────────────────────────────────────
  isShopOpen = false;

  // ── ESTADO: Modal perfil ─────────────────────────────────────────
  isProfileOpen = false;

  // ── ESTADO: Modal estrellas ──────────────────────────────────────
  isStarsModalOpen = false;
  
  // ── DATOS: Mundos y progreso de estrellas (Simulación) ─────────
  worldsProgress = Array.from({ length: 10 }, (_, i) => ({
    level: i + 1,
    name: `Mundo ${i + 1}`,
    stars: Math.floor(Math.random() * 4) // 0, 1, 2, o 3 estrellas aleatorias para probar
  }));


  // ── CICLO DE VIDA ────────────────────────────────────────────────
  ngOnInit(): void {
    this.userProfile$ = this.userService.getProfile();
    this.generateRunes();
    this.setGreeting();

    // Mapea el perfil del usuario para inyectar su nombre real en el template del saludo
    this.greetingMessage$ = this.userProfile$.pipe(
      map(profile => this.greetingTemplate.replace('{nombre}', profile.nombre))
    );
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
      '¡Buenos días, {nombre}! ¿Listo para forjar código hoy?',
      '¡Despierta, {nombre}! El reino del código te espera.',
      '¡Los dragones madrugadores conquistan más reinos, {nombre}!',
      '¡Mañana de aventuras, {nombre}! ¿Qué misión atacamos hoy?',
      '¡Buenos días, valiente {nombre}! El conocimiento aguarda tu llegada.',
    ];

    const afternoon = [
      '¡Buenas tardes, {nombre}! Sigue conquistando el código.',
      '¡Tarde productiva, {nombre}! Los dragones no descansan.',
      '¡Hola de nuevo, {nombre}! La tarde es perfecta para aprender.',
      '¡Sigue así, {nombre}! El código no se forja solo.',
      'Tarde a tarde, un paso más al dominio total, {nombre}.',
    ];

    const night = [
      '¡Buenas noches, {nombre}! Los mejores programadores trabajan de noche.',
      '¡Sesión nocturna, {nombre}! La oscuridad hace brillar el código.',
      'Los dragones nocturnos son los más legendarios, {nombre}.',
      '¡Un último reto antes de descansar, {nombre}!',
      'Las mejores ideas nacen bajo las estrellas, {nombre}.',
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

    this.greetingTemplate = pool[Math.floor(Math.random() * pool.length)];
  }


  // ── MODAL: Tienda ───────────────────────────────────────────────
  openShop(): void {
    this.isShopOpen = true;
  }

  // ── MODAL: Perfil ───────────────────────────────────────────────
  openProfile(): void {
    this.isProfileOpen = true;
  }

  closeProfile(): void {
    this.isProfileOpen = false;
  }

  closeShop(): void {
    this.isShopOpen = false;
  }

  onAvatarChanged(newAvatarPath: string): void {
    this.selectedAvatar = newAvatarPath;
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
