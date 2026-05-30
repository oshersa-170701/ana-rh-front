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
  AlertController
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { Empleado, EmpleadosService } from 'src/app/services/empleados';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

// ✨ IMPORTAMOS EL NUEVO COMPONENTE EXCLUSIVO PARA SUPERADMIN
import { AgregarEmpleadoSuperadminComponent } from 'src/app/components/modals/agregar-empleado-superadmin/agregar-empleado-superadmin.component';
import { EditarEmpleadoSuperadminComponent } from 'src/app/components/modals/editar-empleado-superadmin/editar-empleado-superadmin.component';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.page.html',
  styleUrls: ['./empleados.page.scss'],
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
  providers: [ModalController, ToastController, AlertController]
})
export class EmpleadosPage implements OnInit {
  empleados: Empleado[] = [];

  constructor(
    private empleadosService: EmpleadosService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    addIcons({ addOutline, createOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.empleadosService.getEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
      },
      error: (err) => {
        console.error('Error al traer los empleados de NestJS:', err);
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

  // ✨ LOGICA IMPLEMENTADA: Abre el modal del Superadmin de manera limpia
  async abrirModalAgregar() {
    const modal = await this.modalCtrl.create({
      component: AgregarEmpleadoSuperadminComponent,
      mode: 'ios', // Mantenemos la estética limpia deslizando desde abajo
      cssClass: 'custom-modal-class' // Por si tienes estilos globales aplicados
    });

    await modal.present();

    const { role } = await modal.onWillDismiss();

    // Si el modal ejecutó un dismiss exitoso, refrescamos la tabla reactiva
    if (role === 'confirm') {
      this.cargarEmpleados();
    }
  }

 // ✨ 2. IMPLEMENTACIÓN COMPLETA DE LA LÓGICA DE EDICIÓN
  async abrirModalEditar(empleado: Empleado) {
    const modal = await this.modalCtrl.create({
      component: EditarEmpleadoSuperadminComponent,
      mode: 'ios',
      componentProps: {
        empleadoData: empleado 
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      
      let payload: any;

      // ✨ DETECCIÓN INTELIGENTE DE CAMBIO DE FOTO:
      if (data.nuevaFoto) {
        // Si hay una foto nueva seleccionada, construimos un FormData multipart
        const formData = new FormData();
        
        Object.keys(data).forEach(key => {
          if (key === 'nuevaFoto') {
            formData.append('foto', data.nuevaFoto, 'perfil_actualizado.jpg');
          } else if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
        payload = formData;
      } else {
        // Si no se cambió la foto, removemos la variable fantasma para que no truene el DTO
        const { nuevaFoto, ...datosLimpios } = data;
        payload = datosLimpios;
      }

      // Envia el payload limpio (JSON o FormData) a tu servicio
      this.empleadosService.updateEmpleado(empleado.id!, payload).subscribe({
        next: (res) => {
          this.mostrarToast('Empleado actualizado con éxito 🎉', 'success', 'checkmark-circle-outline');
          this.cargarEmpleados();
        },
        error: (err) => {
          console.error('Error al actualizar el empleado en NestJS:', err);
          this.mostrarToast('Hubo un error al actualizar los datos ❌', 'danger', 'alert-circle-outline');
        }
      });
    }
  }

 // ✨ IMPLEMENTACIÓN DE ALERTA NATIVA PARA ELIMINACIÓN SEGURA
  async confirmarEliminacion(empleado: Empleado) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      subHeader: `¿Deseas dar de baja a este empleado?`,
      message: `Esta acción eliminará permanentemente a ${empleado.nombre_completo} del sistema.`,
      mode: 'ios', // Mantiene la estética premium e integrada de iOS
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel', // Por si quieres meterle estilos propios
          handler: () => {
            console.log('Eliminación cancelada por el usuario');
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive', // Pinta el texto en rojo indicando peligro
          cssClass: 'alert-button-confirm',
          handler: () => {
            // Ejecutamos la baja reactiva llamando al servicio
            this.empleadosService.deleteEmpleado(empleado.id!).subscribe({
              next: () => {
                this.mostrarToast('Empleado eliminado correctamente ', 'success', 'checkmark-circle-outline');
                this.cargarEmpleados(); // 🔄 Refrescamos la vista en tiempo real sin recargar la página
              },
              error: (err) => {
                console.error('Error al intentar eliminar el empleado en NestJS:', err);
                this.mostrarToast('No se pudo eliminar el registro ', 'danger', 'alert-circle-outline');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
}