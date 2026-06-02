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
import { saveOutline, alertCircleOutline, checkmarkCircleOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';

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
  
  @Input() empresaData!: any;

  // Estructura sincronizada con la base de datos MySQL 🎯
  empresaEditada = {
    nombre: '',
    rfc: '',
    logo_url: '', 
    estatus: true
  };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    // Registramos los iconos obligatorios de la interfaz
    addIcons({closeOutline,imageOutline,trashOutline,saveOutline,alertCircleOutline,checkmarkCircleOutline});
  }

  ngOnInit() {
    if (this.empresaData) {
      // Si el logo viene de la BD como ruta parcial (ej: uploads/logos/...), 
      // le inyectamos el puerto del servidor para que se dibuje correctamente en la vista previa.
      let urlLogotipo = '';
      if (this.empresaData.logo_url) {
        urlLogotipo = this.empresaData.logo_url.startsWith('data:') || this.empresaData.logo_url.startsWith('http')
          ? this.empresaData.logo_url
          : `http://localhost:3000/${this.empresaData.logo_url}`;
      }

      this.empresaEditada = {
        nombre: this.empresaData.nombre,
        rfc: this.empresaData.rfc,
        logo_url: urlLogotipo,
        estatus: this.empresaData.estatus
      };
    }
  }

  // 📷 LECTOR BINARIO: Transforma el archivo cargado a formato Base64 para transportación en el JSON
  seleccionarFoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.empresaEditada.logo_url = reader.result as string;
    };
    reader.readAsDataURL(file);
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

      if (!nombreLimpio || !rfcLimpio) {
        await this.mostrarToast('Por favor, rellena todos los campos obligatorios.', 'danger', 'alert-circle-outline');
        return;
      }

      if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
        await this.mostrarToast('El RFC debe tener entre 12 y 13 caracteres.', 'danger', 'alert-circle-outline');
        return;
      }

      await this.mostrarToast('Cambios procesados con éxito.', 'success', 'checkmark-circle-outline');

      // Devolvemos el payload acoplado incluyendo el nuevo logo (o nulo si se removió)
      this.modalCtrl.dismiss({ 
        nombre: nombreLimpio, 
        rfc: rfcLimpio, 
        logo_url: this.empresaEditada.logo_url || null,
        estatus: this.empresaEditada.estatus 
      }, 'confirm');

    } catch (error) {
      await this.mostrarToast('Hubo un error inesperado al validar la actualización.', 'danger', 'alert-circle-outline');
    }
  }
}