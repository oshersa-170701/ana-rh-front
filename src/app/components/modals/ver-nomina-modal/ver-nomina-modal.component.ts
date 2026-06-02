import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonSpinner,
  IonBadge,
  ModalController,
  AlertController // 👈 1. Importamos el AlertController
} from '@ionic/angular/standalone';
import { NominasService } from 'src/app/services/nominas';
import { EstatusNomina, NominaResponse } from 'src/app/models1/nomina.interface';

@Component({
  selector: 'app-ver-nomina-modal',
  templateUrl: './ver-nomina-modal.component.html',
  styleUrls: ['./ver-nomina-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonSpinner,
    IonBadge,
    CommonModule, 
    FormsModule
  ]
})
export class VerNominaModalComponent implements OnInit {
  
  @Input() nominaId!: string;

  nomina: NominaResponse | null = null;
  cargando = true;
  procesandoEstatus = false; 

  public EstatusEnum = EstatusNomina;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController, // 👈 2. Inyectamos el AlertController
    private nominasService: NominasService
  ) { }

  ngOnInit() {
    this.cargarDetalleCompleto();
  }

  cargarDetalleCompleto() {
    this.cargando = true;
    this.nominasService.getDetalleNomina(this.nominaId).subscribe({
      next: (data) => {
        this.nomina = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al recuperar el desglose financiero:', err);
        this.cargando = false;
        this.cerrar();
      }
    });
  }

  // 🚀 CAMBIO DE ESTADO: Ahora utiliza el AlertController asíncrono de Ionic
  async cambiarEstado(nuevoEstatus: EstatusNomina) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Acción',
      subHeader: `Cambiar estatus a: ${nuevoEstatus}`,
      message: `¿Estás seguro de que deseas marcar este período de nómina como ${nuevoEstatus.toLowerCase()}? Esta acción afectará el historial contable.`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-btn-cancelar' // Por si quieres darle estilos específicos luego
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: () => {
            this.ejecutarCambioEstatus(nuevoEstatus);
          }
        }
      ]
    });

    await alert.present();
  }

  // Lógica de consumo del servicio aislada para limpieza del código
  private ejecutarCambioEstatus(nuevoEstatus: EstatusNomina) {
    this.procesandoEstatus = true;
    this.nominasService.cambiarEstatusNomina(this.nominaId, nuevoEstatus).subscribe({
      next: (res) => {
        this.procesandoEstatus = false;
        if (this.nomina) {
          this.nomina.estatus = res.estatus; 
        }
      },
      error: (err) => {
        this.procesandoEstatus = false;
        console.error('Error al actualizar el estatus:', err);
        this.mostrarAlertaError(err.error?.message || 'Ocurrió un error al procesar el cambio de estado.');
      }
    });
  }

  // Alerta secundaria para notificar errores del servidor de forma estética
  async mostrarAlertaError(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error Operativo',
      message: mensaje,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  getEstatusClass(estatus: EstatusNomina): string {
    switch (estatus) {
      case EstatusNomina.BORRADOR: return 'borrador-tag';
      case EstatusNomina.TIMBRADA: return 'timbrada-tag';
      case EstatusNomina.PAGADA: return 'pagada-tag';
      default: return 'neutral-tag';
    }
  }

  cerrar() {
    this.modalCtrl.dismiss({ estatusActualizado: this.nomina?.estatus });
  }
}