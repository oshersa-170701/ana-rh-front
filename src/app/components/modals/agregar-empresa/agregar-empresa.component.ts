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
  IonNote,            
  ToastController      
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, alertCircleOutline, checkmarkCircleOutline, imageOutline, trashOutline } from 'ionicons/icons';

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
    rfc: '',
    logo_url: '' // 👈 Inicializamos el campo para capturar la imagen en Base64
  };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController 
  ) {
    // Agregamos imageOutline a la colección de iconos nativos
    addIcons({imageOutline,trashOutline,saveOutline,alertCircleOutline,checkmarkCircleOutline});
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  // 📷 PROCESADOR DE IMAGEN: Transforma el archivo binario a Base64
  seleccionarFoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // Guardamos la cadena de datos binarios renderizable en el modelo
      this.nuevaEmpresa.logo_url = reader.result as string;
    };
    reader.readAsDataURL(file);
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
      const nombreLimpio = this.nuevaEmpresa.nombre.trim();
      const rfcLimpio = this.nuevaEmpresa.rfc.trim().toUpperCase();

      if (!nombreLimpio || !rfcLimpio) {
        await this.mostrarToast('Por favor, rellena todos los campos obligatorios.', 'danger', 'alert-circle-outline');
        return;
      }

      if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
        await this.mostrarToast('El RFC no tiene una longitud válida (12 o 13 caracteres).', 'danger', 'alert-circle-outline');
        return;
      }

      await this.mostrarToast('Empresa procesada con éxito.', 'success', 'checkmark-circle-outline');

      // Empacamos el payload incluyendo el logo listo para guardarse en MySQL
      const datosParaBackend = {
        nombre: nombreLimpio,
        rfc: rfcLimpio,
        logo_url: this.nuevaEmpresa.logo_url || null // Envíamos la cadena Base64
      };

      this.modalCtrl.dismiss(datosParaBackend, 'confirm');

    } catch (error) {
      await this.mostrarToast('Hubo un error inesperado al validar los datos de la empresa.', 'danger', 'alert-circle-outline');
    }
  }
}