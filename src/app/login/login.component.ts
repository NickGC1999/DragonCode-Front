import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router'; // 1. Importas el enrutador

interface Rune {
  symbol: string;
  top: string;
  left: string;
  color: string;
  delay: string;
  duration: string;
  fontSize: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink], // 2. Se lo inyectas al componente
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  currentAvatar: string = '';
  runes: Rune[] = [];

  // Centralizamos los avatares aquí
  private readonly DRACO_AVATARS: string[] = [
    'assets/images/draco/drakobase.png',
    'assets/images/draco/drakoforja.png',
    'assets/images/draco/drakoguia.png',
    'assets/images/draco/drakoirritado.png',
    'assets/images/draco/drakoorgulloso.png',
    'assets/images/draco/drakoserio.png',
    'assets/images/draco/drakosorprendido.png'
  ];

  ngOnInit(): void {
    this.setRandomAvatar();
    this.generateRunes();
  }

  private setRandomAvatar(): void {
    const randomIndex = Math.floor(Math.random() * this.DRACO_AVATARS.length);
    this.currentAvatar = this.DRACO_AVATARS[randomIndex];
  }

  private generateRunes(): void {
    // Añadimos más símbolos místicos al arreglo para aumentar su probabilidad de aparición
    const symbols = ['{}', '[;]', '*', '01', '=>', '</>', '✧', '✦', 'Δ', '∇', 'Ω', '⎈', '≈', '⟁', '✧', '✦', 'Δ', 'Ω', '⎈'];
    const colors = ['#D8BFD8', '#ADD8E6', '#FFB6C1', '#FFFFFF'];
    
    // Subimos un poco la cantidad general
    const numRunes = 65; 

    for (let i = 0; i < numRunes; i++) {
      let randomTop = Math.random() * 100;
      let randomLeft = Math.random() * 100;

      // El Algoritmo de Zona Muerta: Si la coordenada cae en el centro de la pantalla...
      if (randomTop > 25 && randomTop < 75 && randomLeft > 25 && randomLeft < 75) {
        // ...empujamos la runa aleatoriamente hacia el borde izquierdo o el derecho
        randomLeft = Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
      }

      this.runes.push({
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        top: randomTop + '%',
        left: randomLeft + '%',
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: (Math.random() * 5) + 's',
        duration: (Math.random() * 5 + 4) + 's',
        fontSize: (Math.floor(Math.random() * 6) + 10) + 'px'
      });
    }
  }
}