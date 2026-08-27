import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  ModalController, IonSpinner, IonIcon, IonButtons, IonDatetimeButton, IonPopover } from '@ionic/angular/standalone';
import { NominasService } from 'src/app/services/nominas';
import { addIcons } from 'ionicons';
import { calendarOutline, closeOutline, informationCircleOutline, calculatorOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registrar-nomina-modal',
  templateUrl: './registrar-nomina-modal.component.html',
  styleUrls: ['./registrar-nomina-modal.component.scss'],
  standalone: true,
  imports: [IonPopover, IonDatetimeButton, IonButtons, IonIcon, IonSpinner, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    CommonModule, 
    FormsModule
  ]
})
export class RegistrarNominaModalComponent implements OnInit {

  // Modelo de datos alineado al DTO del backend
  periodo_inicio: string = '';
  periodo_fin: string = '';
  guardando = false;
  nominaForm: FormGroup;
  constructor(
    private modalCtrl: ModalController,
    private nominasService: NominasService,
     private fb: FormBuilder,
  ) { addIcons({closeOutline,informationCircleOutline,calendarOutline,calculatorOutline}); 
 this.nominaForm = this.fb.group({
    periodo_inicio: [''],
    periodo_fin: ['']
  });
}
  



  ngOnInit() {}

  cerrar() {
    this.modalCtrl.dismiss();
  }


  guardar() {
    if (!this.periodo_inicio || !this.periodo_fin) {
    //  alert('Por favor, selecciona ambas fechas del período.');
      this.toast('Por favor, selecciona ambas fechas del período.', 'danger');
      return;
    }

    this.guardando = true;
    const tenantId = localStorage.getItem('admin_tenant_id') || '';

    const payload = {
      tenant_id: tenantId,
      periodo_inicio: this.periodo_inicio,
      periodo_fin: this.periodo_fin
    };

    this.nominasService.crearNomina(payload).subscribe({
      next: (res) => {
        this.guardando = false;
        // Al cerrar, pasamos una bandera de éxito para refrescar la tabla del historial
        this.modalCtrl.dismiss({ registrado: true });
      },
      error: (err) => {
        this.guardando = false;
     //   console.error('Error al generar la nómina:', err);
        this.toast(err.error?.message || 'Error al procesar el cálculo del período.', 'danger');
      }
    });
  }
  async toast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 3000;
    toast.color = color;
    document.body.appendChild(toast);
    await toast.present();
  }
}