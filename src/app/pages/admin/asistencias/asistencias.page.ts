import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonSpinner, 
  IonNote,
  ModalController 
} from '@ionic/angular/standalone'; 

import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { AsistenciasService } from 'src/app/services/asistencias';
import { RegistrarIncidenciaModalComponent } from 'src/app/components/modals/registrar-incidencia-modal/registrar-incidencia-modal.component';
import { VerIncidenciaModalComponent } from 'src/app/components/modals/ver-indicencia-modal/ver-indicencia-modal.component';


@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonNote, CommonModule, FormsModule, AppHeaderComponent]
})
export class AsistenciasPage implements OnInit {

  listaAsistencias: Array<any> = [];
  cargando = true;

  constructor(
    private asistenciasService: AsistenciasService, 
    private modalCtrl: ModalController 
  ) { }

  ngOnInit() {
    this.cargarHistorialAsistencias();
  }

  cargarHistorialAsistencias() {
    // Activamos el spinner solo si la lista está vacía para evitar parpadeos molestos al refrescar
    if (this.listaAsistencias.length === 0) {
      this.cargando = true;
    }

    const tenantId = localStorage.getItem('admin_tenant_id') || '';
    const sucursalId = localStorage.getItem('admin_sucursal_id') || '';

    if (tenantId && sucursalId) {
      this.asistenciasService.getAsistenciasPorSucursal(tenantId, sucursalId).subscribe({
        next: (data) => {
          this.listaAsistencias = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error al recuperar asistencias:", err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
      console.warn("⚠️ No se encontraron credenciales de sucursal en el almacenamiento local.");
    }
  }

  getBadgeColor(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'success-tag';
      case 'INICIO_ALMUERZO': return 'warning-tag';
      case 'FIN_ALMUERZO': return 'info-tag';
      case 'SALIDA': return 'danger-tag';
      default: return 'neutral-tag';
    }
  }

  async abrirModalIncidencia(empleado: any) {
    const modal = await this.modalCtrl.create({
      component: RegistrarIncidenciaModalComponent,
      componentProps: {
        empleadoData: empleado
      }
    });
    
    await modal.present();

    // 🔄 REFRESCO AUTOMÁTICO: Escuchamos el cierre del modal de creación
    const { data } = await modal.onDidDismiss();
    
    // Si tu modal retorna un bandera de éxito (ej: { registrado: true }) al cerrarse, la evaluamos.
    // Si no retorna nada, puedes dejar simplemente un this.cargarHistorialAsistencias() directo.
    this.cargarHistorialAsistencias();
  }

  async abrirModalVerIncidencia(incidencia: any) {
    const modal = await this.modalCtrl.create({
      component: VerIncidenciaModalComponent,
      componentProps: {
        incidenciaData: incidencia 
      }
    });
    await modal.present();
  }
}