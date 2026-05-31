import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonAvatar, IonBadge, IonText, IonNote, IonHeader, IonToolbar,
  IonFab, IonFabButton, IonIcon, IonButton, ModalController, AlertController, ToastController 
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { Empleado, EmpleadosService } from 'src/app/services/empleados';
import { AuthService } from 'src/app/services/auth';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

import { AddEmpleadoModalComponent } from 'src/app/components/add-empleado-modal/add-empleado-modal.component';
import { EditarEmpleadoSupervisorComponent } from 'src/app/components/modals/editar-empleado-supervisor/editar-empleado-supervisor.component';

@Component({
  selector: 'app-empleados-supervisor',
  templateUrl: './empleados-supervisor.page.html',
  styleUrls: ['./empleados-supervisor.page.scss'],
  standalone: true,
  imports: [
    IonToolbar, IonHeader, IonContent, IonAvatar, IonBadge, IonFab, IonFabButton,
    IonIcon, IonButton, CommonModule, FormsModule, AppHeaderComponent
  ],
  providers: [ModalController, AlertController, ToastController]
})
export class EmpleadosSupervisorPage implements OnInit {

  empleadosSucursal: Empleado[] = [];
  usuarioLogueado: string = ''; 
  usuarioLogueadoId: string = ''; 
  loading = true;
  
  constructor(
    private empleadosService: EmpleadosService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.usuarioLogueado = localStorage.getItem('admin_user_username') || localStorage.getItem('admin_user') || '';
    this.usuarioLogueadoId = localStorage.getItem('admin_user_id') || '';
    this.cargarPersonalLocal();
  }

  cargarPersonalLocal() {
    this.loading = true;
    const miSucursal = localStorage.getItem('admin_sucursal_id');
    const miEmpresa = localStorage.getItem('admin_tenant_id');

    this.empleadosService.getEmpleados().subscribe({
      next: (data) => {
        // Filtramos para renderizar únicamente el personal de esta sede
        this.empleadosSucursal = data.filter(emp => 
          emp.sucursal_id === miSucursal && emp.tenant_id === miEmpresa
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar personal:', err);
        this.loading = false;
      }
    });
  }

  async abrirModalAgregar() {
    const modal = await this.modalCtrl.create({
      component: AddEmpleadoModalComponent,
      mode: 'ios'
    });
    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'confirm' || role === undefined) {
      this.cargarPersonalLocal(); 
    }
  }

  async abrirModalEditar(empleado: Empleado) {
    const modal = await this.modalCtrl.create({
      component: EditarEmpleadoSupervisorComponent,
      mode: 'ios',
      componentProps: {
        empleadoData: empleado
      }
    });
    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.cargarPersonalLocal(); 
    }
  }

  // 🗑️ MÉTODO DE ELIMINACIÓN SEGURO CON PURGA DE FOTO EN EL DISCO DURO
  async confirmarEliminacion(empleado: Empleado) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Colaborador',
      message: `¿Estás seguro de que deseas eliminar a ${empleado.nombre_completo}?"⚠️ Esta acción eliminará permanentemente su registro y su foto de perfil del servidor.`,
      mode: 'ios',
      buttons: [
        { 
          text: 'Cancelar', 
          role: 'cancel' 
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (!empleado.id) return;

            this.empleadosService.deleteEmpleado(empleado.id).subscribe({
              next: () => {
                // Notificamos el éxito y refrescamos la grilla reactiva inmediatamente
                this.mostrarToast('Empleado y archivos eliminados correctamente', 'success', 'checkmark-circle-outline');
                this.cargarPersonalLocal();
              },
              error: (err) => {
                console.error('Error al remover el registro:', err);
                this.mostrarToast('Error al eliminar el registro del servidor', 'danger', 'alert-circle-outline');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger', icono: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color: color,
      icon: icono,
      position: 'top'
    });
    await toast.present();
  }
}