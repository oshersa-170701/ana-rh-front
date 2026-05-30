import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonContent, 
  IonInput, 
  IonIcon,
  IonNote,             // ✨ Importante para los mensajes guía
  ToastController      // ✨ Importante para las notificaciones flotantes
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-agregar-empresa',
  templateUrl: './agregar-empresa.component.html',
  styleUrls: ['./agregar-empresa.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonIcon,
    IonNote
  ]
})
export class AgregarEmpresaComponent {
  nuevaEmpresa = {
    nombre: '',
    rfc: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController 
  ) {
    addIcons({ saveOutline, alertCircleOutline, checkmarkCircleOutline });
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  //  Método reutilizable para disparar mensajes Toast con estilo
  async mostrarToast(mensaje: string, color: 'success' | 'danger', icono: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top', // Lo ponemos arriba para que no estorbe el teclado
      color: color,
      buttons: [{ text: 'OK', role: 'cancel' }],
      icon: icono
    });
    await toast.present();
  }

 async guardar() {
    try {
      const nombreLimpio = this.nuevaEmpresa.nombre.trim();
      const rfcLimpio = this.nuevaEmpresa.rfc.trim().toUpperCase();

      // 1. Validación de campos vacíos
      if (!nombreLimpio || !rfcLimpio) {
        await this.mostrarToast('Por favor, rellena todos los campos obligatorios.', 'danger', 'alert-circle-outline');
        return;
      }

      // 2. Validación de longitud del RFC
      if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
        await this.mostrarToast('El RFC no tiene una longitud válida (12 o 13 caracteres).', 'danger', 'alert-circle-outline');
        return;
      }

      // Si pasa los filtros locales con éxito
      await this.mostrarToast('Empresa procesada con éxito.', 'success', 'checkmark-circle-outline');

      const datosParaBackend = {
        nombre: nombreLimpio,
        rfc: rfcLimpio
      };

      this.modalCtrl.dismiss(datosParaBackend, 'confirm');

    } catch (error) {
      // 💥 Captura cualquier fallo crítico en el flujo de datos del formulario
    //  console.error('Error interno al procesar el formulario:', error);
      await this.mostrarToast('Hubo un error inesperado al validar los datos de la empresa.', 'danger', 'alert-circle-outline');
    }
  }
}