import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonBadge,
  ModalController,
  ToastController,
  AlertController // ✨ 1. Importamos el AlertController desde standalone
} from '@ionic/angular/standalone'; 
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { Empresa, Empresas } from 'src/app/services/empresas';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { AgregarEmpresaComponent } from 'src/app/components/modals/agregar-empresa/agregar-empresa.component';
import { EditarEmpresaComponent } from 'src/app/components/modals/editar-empresa/editar-empresa.component';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.page.html',
  styleUrls: ['./empresas.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonBadge,
    CommonModule,
    FormsModule,
    AppHeaderComponent
  ],
  // ✨ 2. Agregamos AlertController a los proveedores locales
  providers: [ModalController, ToastController, AlertController] 
})
export class EmpresasPage implements OnInit {
  empresas: Empresa[] = [];

  // ✨ 3. Inyectamos alertCtrl en el constructor
  constructor(
    private empresasService: Empresas, 
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController 
  ) {
    addIcons({ addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    this.empresasService.getEmpresas().subscribe({
      next: (data) => {
        this.empresas = data;
      },
      error: (err) => {
        console.error('Error al traer las empresas de NestJS:', err);
      }
    });
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger', icono: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color,
      icon: icono,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  async abrirModalAgregar() {
    const modal = await this.modalCtrl.create({
      component: AgregarEmpresaComponent,
      cssClass: 'custom-modal-class',
      mode: 'ios'
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.empresasService.createEmpresa(data).subscribe({
        next: (res) => {
          this.mostrarToast('Empresa registrada con éxito.', 'success', 'checkmark-circle-outline');
          this.cargarEmpresas(); 
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          const msg = err.error?.message || 'No se pudo registrar la empresa.';
          this.mostrarToast(msg, 'danger', 'alert-circle-outline');
        }
      });
    }
  }

  async abrirModalEditar(empresa: Empresa) {
    const modal = await this.modalCtrl.create({
      component: EditarEmpresaComponent,
      componentProps: { empresaData: empresa },
      mode: 'ios'
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data && empresa.id) {
      this.empresasService.updateEmpresa(empresa.id, data).subscribe({
        next: (res) => {
          this.mostrarToast('Empresa actualizada con éxito.', 'success', 'checkmark-circle-outline');
          this.cargarEmpresas(); 
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          const msg = err.error?.message || 'No se pudo actualizar la empresa. Verifica los datos ingresados.';
          this.mostrarToast(msg, 'danger', 'alert-circle-outline');
        }
      });
    }
  }

  // ✨ 4. NUEVO MÉTODO: Alerta de Confirmación de Eliminación
  async confirmarEliminacion(empresa: Empresa) {
    if (!empresa.id) return;

    const alert = await this.alertCtrl.create({
      header: '¿Confirmar eliminación?',
      subHeader: `Empresa: ${empresa.nombre}`,
      message: 'Esta acción no se puede deshacer y eliminará permanentemente el registro.',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel' // Por si deseas meterle estilos custom luego
        },
        {
          text: 'Eliminar',
          role: 'destructive', // Le da un estilo de advertencia rojo nativo en iOS
          handler: () => {
            // Si el usuario presiona "Eliminar", llamamos a la API de NestJS
            this.empresasService.deleteEmpresa(empresa.id!).subscribe({
              next: () => {
                this.mostrarToast('Empresa eliminada correctamente.', 'success', 'checkmark-circle-outline');
                this.cargarEmpresas(); // Refrescamos la grilla inmediatamente
              },
              error: (err) => {
                console.error('Error al eliminar la empresa:', err);
                const msg = err.error?.message || 'No se pudo eliminar la empresa. Puede que tenga sucursales vinculadas.';
                this.mostrarToast(msg, 'danger', 'alert-circle-outline');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
}