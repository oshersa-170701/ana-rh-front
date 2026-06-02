import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  ModalController, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-ver-incidencia-modal',
  templateUrl: './ver-indicencia-modal.component.html',
  styleUrls: ['./ver-indicencia-modal.component.scss'],
  standalone: true,
  imports: [IonIcon, 
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

  constructor(private modalCtrl: ModalController) {
    addIcons({closeOutline});
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}