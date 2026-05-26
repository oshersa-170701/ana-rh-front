import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-saludo-empleado',
  standalone: true,
  imports: [IonicModule],
  template: `
    <div class="saludo-modal">
      <div class="check-icon">✅</div>
      <h2>¡Bienvenido, {{ nombre }}!</h2>
      <p><b>Puesto:</b> {{ puesto }}</p>
      <p><b>CURP:</b> {{ curp }}</p>
      <ion-button expand="block" (click)="cerrar()">Entendido</ion-button>
    </div>
  `,
  styles: [`
    .saludo-modal { padding: 40px; text-align: center; }
    .check-icon { font-size: 80px; margin-bottom: 20px; }
    h2 { color: #6a1b9a; font-weight: 800; }
  `]
})
export class SaludoEmpleadoComponent {
  @Input() nombre!: string;
  @Input() puesto!: string;
  @Input() curp!: string;
  constructor(private modalCtrl: ModalController) {}
  cerrar() { this.modalCtrl.dismiss(); }
}