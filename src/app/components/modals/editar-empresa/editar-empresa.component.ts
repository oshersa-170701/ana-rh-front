import { Component, Input, OnInit } from '@angular/core';
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
  IonNote,
  IonItem,
  IonSelect,
  IonSelectOption,
  ToastController 
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-editar-empresa',
  templateUrl: './editar-empresa.component.html',
  styleUrls: ['./editar-empresa.component.scss'],
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
    IonNote,
    IonItem,
    IonSelect,
    IonSelectOption
  ]
})
export class EditarEmpresaComponent implements OnInit {
  // ✨ Recibe los datos completos desde la tabla
  @Input() empresaData!: any;

  // Objeto local para el formulario
  empresaEditada = {
    nombre: '',
    rfc: '',
    estatus: true
  };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ saveOutline, alertCircleOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    // Clonamos los datos recibidos para rellenar los inputs al abrirse
    if (this.empresaData) {
      this.empresaEditada = {
        nombre: this.empresaData.nombre,
        rfc: this.empresaData.rfc,
        estatus: this.empresaData.estatus
      };
    }
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger', icono: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [{ text: 'OK', role: 'cancel' }],
      icon: icono
    });
    await toast.present();
  }

async guardar() {
    try {
      const nombreLimpio = this.empresaEditada.nombre.trim();
      const rfcLimpio = this.empresaEditada.rfc.trim().toUpperCase();

      // 1. Validación de campos vacíos
      if (!nombreLimpio || !rfcLimpio) {
        await this.mostrarToast('Por favor, rellena todos los campos obligatorios.', 'danger', 'alert-circle-outline');
        return;
      }

      // 2. Validación de longitud del RFC
      if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
        await this.mostrarToast('El RFC debe tener entre 12 y 13 caracteres.', 'danger', 'alert-circle-outline');
        return;
      }

      // ✨ Toast de éxito local si pasa los filtros antes de cerrar
      await this.mostrarToast('Cambios procesados con éxito.', 'success', 'checkmark-circle-outline');

      // Retornamos los datos modificados con éxito
      this.modalCtrl.dismiss({ 
        nombre: nombreLimpio, 
        rfc: rfcLimpio, 
        estatus: this.empresaEditada.estatus 
      }, 'confirm');

    } catch (error) {
      // 💥 Toast de error por si ocurre un fallo inesperado en el hilo de ejecución
    //  console.error('Error interno al validar la edición:', error);
      await this.mostrarToast('Hubo un error inesperado al validar la actualización.', 'danger', 'alert-circle-outline');
    }
  }
}