import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonSpinner, 
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { NominasService } from 'src/app/services/nominas';
import { EstatusNomina, NominaResponse } from 'src/app/models1/nomina.interface';
import { RegistrarNominaModalComponent } from 'src/app/components/modals/registrar-nomina-modal/registrar-nomina-modal.component';
import { VerNominaModalComponent } from 'src/app/components/modals/ver-nomina-modal/ver-nomina-modal.component';

@Component({
  selector: 'app-nominas',
  templateUrl: './nominas.page.html',
  styleUrls: ['./nominas.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonSpinner, 
    IonButton,
    IonIcon,
    CommonModule, 
    FormsModule, 
    AppHeaderComponent
  ]
})
export class NominasPage implements OnInit {

  listaNominas: NominaResponse[] = [];
  cargando = true;

  constructor(private nominasService: NominasService, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.cargarHistorialNominas();
  }

  cargarHistorialNominas() {
    this.cargando = true;
    const tenantId = localStorage.getItem('admin_tenant_id') || '';

    if (tenantId) {
      this.nominasService.getNominasPorTenant(tenantId).subscribe({
        next: (data) => {
          this.listaNominas = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error al recuperar el historial de nóminas:", err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
      console.warn("⚠️ No se encontró el tenant_id en el almacenamiento local.");
    }
  }

  // Helper para asignar las clases de estilo CSS según el enum de MySQL
  getEstatusClass(estatus: EstatusNomina): string {
    switch (estatus) {
      case EstatusNomina.BORRADOR: return 'borrador-tag';
      case EstatusNomina.TIMBRADA: return 'timbrada-tag';
      case EstatusNomina.PAGADA: return 'pagada-tag';
      default: return 'neutral-tag';
    }
  }

  async abrirModalNuevaNomina() {
  const modal = await this.modalCtrl.create({
    mode: 'ios', // Puedes elegir el estilo que prefieras
    component: RegistrarNominaModalComponent,
    cssClass: 'modal-chico' // Puedes darle dimensiones personalizadas en tu global.scss si gustas
  });
  
  await modal.present();

  // Escuchamos cuando el modal se cierre
  const { data } = await modal.onDidDismiss();
  if (data?.registrado) {
    this.cargarHistorialNominas(); // 🔄 ¡Refresco reactivo automático!
  }
}
async abrirDetalleNomina(id: string) {
    const modal = await this.modalCtrl.create({
      component: VerNominaModalComponent,
      componentProps: { nominaId: id },
      mode: 'ios'
    });
    
    await modal.present();

    // 🔄 Recibimos el estatus final al cerrar el desglose
    const { data } = await modal.onDidDismiss();
    if (data?.estatusActualizado) {
      // Volvemos a consultar para actualizar las etiquetas del historial
      this.cargarHistorialNominas();
    }
  }

}