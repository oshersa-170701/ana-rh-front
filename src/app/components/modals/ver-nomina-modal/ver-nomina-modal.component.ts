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
  AlertController, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { NominasService } from 'src/app/services/nominas';
import { EstatusNomina, NominaResponse, NominaDetalleResponse } from 'src/app/models1/nomina.interface';
import { PdfGeneratorService } from 'src/app/services/pdf-generator';
import { addIcons } from 'ionicons';
import { documentAttachOutline, arrowBackOutline, shieldCheckmarkOutline, cashOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-ver-nomina-modal',
  templateUrl: './ver-nomina-modal.component.html',
  styleUrls: ['./ver-nomina-modal.component.scss'],
  standalone: true,
  imports: [IonButtons, IonIcon, 
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
    private alertCtrl: AlertController, 
    private nominasService: NominasService,
    private pdfService: PdfGeneratorService // 👈 2. Inyectamos el servicio de PDF
  ) { addIcons({closeOutline,shieldCheckmarkOutline,cashOutline,documentAttachOutline,arrowBackOutline}); }

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

  // 🚀 DISPARADOR DEL PDF: Llama a la librería pasándole la info acoplada
descargarPDF(detalle: NominaDetalleResponse) {
    if (this.nomina) {
      
      // 🛡️ DETECTOR DE FORMATO DE IMAGEN MULTI-TENANT
      let urlFinalLogotipo: string | undefined = undefined;

      if (this.nomina.empresa?.logo_url) {
        const logo = this.nomina.empresa.logo_url;
        
        // Si ya es un string Base64 limpio, lo pasamos directo sin alterar
        if (logo.startsWith('data:image/')) {
          urlFinalLogotipo = logo;
        } else {
          // Si es una ruta de archivo estático (ej: uploads/logos/logo.png), le pegamos el backend
          urlFinalLogotipo = 'http://localhost:3000/' + logo;
        }
      }

      const infoEmpresa = {
        nombre: this.nomina.empresa?.nombre || 'EMPRESA LOCAL S.A.',
        logo_url: urlFinalLogotipo
      };

      this.pdfService.generarReciboEmpleado(this.nomina, detalle, infoEmpresa);
    }
  }
  async cambiarEstado(nuevoEstatus: EstatusNomina) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Acción',
      subHeader: `Cambiar estatus a: ${nuevoEstatus}`,
      message: `¿Estás seguro de que deseas marcar este período de nómina como ${nuevoEstatus.toLowerCase()}? Esta acción afectará el historial contable.`,
      backdropDismiss: false,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: () => { this.ejecutarCambioEstatus(nuevoEstatus); }
        }
      ]
    });
    await alert.present();
  }

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