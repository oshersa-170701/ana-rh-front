import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonButton, 
  IonIcon,
  ModalController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { Sucursal, SucursalesService } from 'src/app/services/sucursales'; // 👈 Asegúrate que apunte aquí
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { AgregarSucursalComponent } from 'src/app/components/modals/agregar-sucursal/agregar-sucursal.component';
import { EditarSucursalComponent } from 'src/app/components/modals/editar-sucursal/editar-sucursal.component';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.page.html',
  styleUrls: ['./sucursales.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
    AppHeaderComponent
  ],
  providers: [ModalController, ToastController, AlertController]
})
export class SucursalesPage implements OnInit {
  sucursales: Sucursal[] = [];

  constructor(
    private sucursalesService: SucursalesService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({ addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.cargarSucursales();
  }

  cargarSucursales() {
    this.sucursalesService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
      },
      error: (err) => {
        console.error('Error al traer las sucursales de NestJS:', err);
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
    component: AgregarSucursalComponent,
    mode: 'ios'
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm' && data) {
    this.sucursalesService.createSucursal(data).subscribe({
      next: (res) => {
        this.mostrarToast('Sucursal guardada correctamente.', 'success', 'checkmark-circle-outline');
        this.cargarSucursales(); 
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al guardar la sucursal.', 'danger', 'alert-circle-outline');
      }
    });
  }
}
async abrirModalEditar(sucursal: Sucursal) {
    const modal = await this.modalCtrl.create({
      component: EditarSucursalComponent,
      componentProps: { sucursalData: sucursal },
      mode: 'ios'
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data && sucursal.id) {
      this.sucursalesService.updateSucursal(sucursal.id, data).subscribe({
        next: (res) => {
          this.mostrarToast('Sucursal actualizada con éxito.', 'success', 'checkmark-circle-outline');
          this.cargarSucursales(); 
        },
        error: (err) => {
          console.error(err);
          this.mostrarToast('Error al actualizar la sucursal.', 'danger', 'alert-circle-outline');
        }
      });
    }
  }
  async confirmarEliminacion(sucursal: Sucursal) {
    if (!sucursal.id) return;

    const alert = await this.alertCtrl.create({
      header: '¿Confirmar eliminación?',
      subHeader: `Sucursal: ${sucursal.nombre}`,
      message: 'Esta acción eliminará permanentemente la sucursal del sistema y no se puede deshacer.',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive', // Estilo rojo nativo en iOS de advertencia
          handler: () => {
            // Ejecutamos la petición hacia NestJS pasando el UUID
            this.sucursalesService.deleteSucursal(sucursal.id!).subscribe({
              next: () => {
                this.mostrarToast('Sucursal eliminada correctamente.', 'success', 'checkmark-circle-outline');
                this.cargarSucursales(); // 🔄 Actualización automática de la tabla
              },
              error: (err) => {
                console.error('Error al eliminar sucursal:', err);
                const msg = err.error?.message || 'No se pudo eliminar la sucursal. Verifica las dependencias.';
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