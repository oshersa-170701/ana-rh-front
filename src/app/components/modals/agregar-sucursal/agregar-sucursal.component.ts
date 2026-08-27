import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonInput, IonIcon, IonNote, IonItem, 
  IonSelect, IonSelectOption, IonTextarea, ToastController 
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, alertCircleOutline, businessOutline, closeOutline } from 'ionicons/icons';
import { SucursalesService } from 'src/app/services/sucursales';
import { Empresa, Empresas } from 'src/app/services/empresas';

@Component({
  selector: 'app-agregar-sucursal',
  templateUrl: './agregar-sucursal.component.html',
  styleUrls: ['./agregar-sucursal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonButton, IonContent, IonInput, IonIcon, 
    IonNote, IonItem, IonSelect, IonSelectOption, IonTextarea
  ]
})
export class AgregarSucursalComponent implements OnInit {
  
  empresasActivas: Empresa[] = [];
  sucursalForm: FormGroup;
  nuevaSucursal = {
    tenant_id: '',
    nombre: '',
    direccion: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private empresasService: Empresas,
    private fb: FormBuilder
  ) {
    addIcons({closeOutline,saveOutline,alertCircleOutline,businessOutline});
    this.sucursalForm = this.fb.group({
      tenant_id: ['', Validators.required],
      nombre: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarEmpresasActivas();
  }

  cargarEmpresasActivas() {
    this.empresasService.getEmpresas().subscribe({
      next: (data) => {
        // ✨ Filtramos: Solo empresas con estatus true (Activo)
        this.empresasActivas = data.filter(e => e.estatus === true);
      },
      error: (err) => console.error('Error al cargar empresas:', err)
    });
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  async guardar() {
    if (!this.nuevaSucursal.tenant_id || !this.nuevaSucursal.nombre.trim()) {
      await this.mostrarToast('El nombre y la empresa son obligatorios.', 'danger');
      return;
    }

    // Retornamos los datos a la página principal
    this.modalCtrl.dismiss(this.nuevaSucursal, 'confirm');
  }
}