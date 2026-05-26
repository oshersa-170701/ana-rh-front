import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonIcon,  IonModal } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone'; // 👈 Importación nativa para standalone
import { addIcons } from 'ionicons';
import { personAddOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AddEmpleadoModalComponent } from '../components/add-empleado-modal/add-empleado-modal.component'; // 👈 Importamos el componente del modal

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonModal, 
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButton, IonIcon, 
  ],
  providers: [ModalController] 
})
export class HomePage {
  // Mantenemos solo el estado del de usuario si sigue inline por ahora
  isUsuarioModalOpen = false;

  constructor(private modalCtrl: ModalController) {
    addIcons({ personAddOutline, shieldCheckmarkOutline });
  }

  // --- Lanzar Modal de Empleados por Controlador ---
 async abrirModalEmpleado() {
    const modal = await this.modalCtrl.create({
      component: AddEmpleadoModalComponent,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm') {
      console.log('🟢 Confirmación recibida en Dashboard. Empleado creado:', data);
    }
  }

  // Métodos del modal de usuario (se quedan igual por ahora)
  abrirModalUsuario() {
    this.isUsuarioModalOpen = true;
  }

  cerrarModalUsuario() {
    this.isUsuarioModalOpen = false;
  }
}