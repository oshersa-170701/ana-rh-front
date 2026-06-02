import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  ModalController 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-incidencia-modal',
  templateUrl: './ver-indicencia-modal.component.html',
  styleUrls: ['./ver-indicencia-modal.component.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonButton, 
    CommonModule
  ]
})
export class VerIncidenciaModalComponent {
  
  // 📥 Recibe el objeto relacional de la incidencia cargado desde NestJS
  @Input() incidenciaData!: any;

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}