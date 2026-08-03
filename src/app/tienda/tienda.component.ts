import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

export interface Avatar {
  id:   string;
  name: string;
  path: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.scss'
})
export class TiendaComponent {
  @Input() avatarActual: string = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() avatarChanged = new EventEmitter<string>();

  isConfirmModalOpen = false;
  avatarToBuy: Avatar | null = null;

  avatars: Avatar[] = [
    { id: 'drakobase',     name: 'Drako Base',     path: 'assets/images/tienda/avatares/drakobase.png', price: 5, description: 'El clásico y confiable compañero de código.' },
    { id: 'drakoaprendiz', name: 'Drako Aprendiz', path: 'assets/images/tienda/avatares/drakoaprendiz.png', price: 5, description: 'Listo para absorber nuevos conocimientos.' },
    { id: 'drakocapa',     name: 'Drako Capa',     path: 'assets/images/tienda/avatares/drakocapa.png', price: 5, description: 'Elegancia mágica para tus sesiones.' },
    { id: 'drakochancla',  name: 'Drako Chancla',  path: 'assets/images/tienda/avatares/drakochancla.png', price: 5, description: 'Infalible para corregir bugs malcriados.' },
    { id: 'drakohaaland',  name: 'Drako Haaland',  path: 'assets/images/tienda/avatares/drakohaaland.png', price: 5, description: 'Una máquina de hacer goles en programación.' },
    { id: 'drakombappe',   name: 'Drako Mbappé',   path: 'assets/images/tienda/avatares/drakombappe.png', price: 5, description: 'Rapidez explosiva al compilar.' },
  ];

  constructor(private notificationService: NotificationService) {}

  onClose(): void {
    this.closeModal.emit();
  }

  selectAvatar(avatar: Avatar): void {
    if (this.avatarActual === avatar.path) return;
    this.avatarToBuy = avatar;
    this.isConfirmModalOpen = true;
  }

  confirmPurchase(): void {
    if (this.avatarToBuy) {
      this.avatarChanged.emit(this.avatarToBuy.path);
      this.notificationService.show('Avatar actualizado exitosamente', 'success');
      this.closeModal.emit();
    }
    this.isConfirmModalOpen = false;
    this.avatarToBuy = null;
  }

  cancelPurchase(): void {
    this.isConfirmModalOpen = false;
    this.avatarToBuy = null;
  }
}
