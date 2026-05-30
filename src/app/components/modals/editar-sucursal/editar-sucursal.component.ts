import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonInput, IonIcon, IonNote, IonItem, 
  IonSelect, IonSelectOption, IonTextarea, ToastController 
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, alertCircleOutline } from 'ionicons/icons';
import {  Empresa, Empresas } from 'src/app/services/empresas';

@Component({
  selector: 'app-editar-sucursal',
  templateUrl: './editar-sucursal.component.html',
  styleUrls: ['./editar-sucursal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonButton, IonContent, IonInput, IonIcon, 
    IonNote, IonItem, IonSelect, IonSelectOption, IonTextarea
  ]
})
export class EditarSucursalComponent implements OnInit {
  
  // ✨ Recibimos la sucursal desde la tabla
  @Input() sucursalData!: any;

  empresasActivas: Empresa[] = [];
  
  sucursalEditada = {
    tenant_id: '',
    nombre: '',
    direccion: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private empresasService: Empresas
  ) {
    addIcons({ saveOutline, alertCircleOutline });
  }

  ngOnInit() {
    // 1. Cargamos el listado de empresas para el select
    this.cargarEmpresasActivas();

    // 2. Mapeamos los datos actuales al formulario
    if (this.sucursalData) {
      this.sucursalEditada = {
        tenant_id: this.sucursalData.tenant_id,
        nombre: this.sucursalData.nombre,
        direccion: this.sucursalData.direccion || ''
      };
    }
  }

  cargarEmpresasActivas() {
    this.empresasService.getEmpresas().subscribe({
      next: (data) => {
        // Solo empresas activas para la reasignación
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
    if (!this.sucursalEditada.tenant_id || !this.sucursalEditada.nombre.trim()) {
      await this.mostrarToast('El nombre y la empresa son obligatorios.', 'danger');
      return;
    }

    // Retornamos el objeto modificado
    this.modalCtrl.dismiss(this.sucursalEditada, 'confirm');
  }
}