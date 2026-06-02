import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// ✨ IMPORTACIONES COMPONENTES VISUALES STANDALONE
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonSelect, IonSelectOption, IonInput, IonTextarea, IonNote, IonSpinner, ModalController, ToastController, IonIcon } from '@ionic/angular/standalone';

import { IncidenciaPayload, IncidenciasService } from 'src/app/services/incidencias';

@Component({
  selector: 'app-registrar-incidencia-modal',
  templateUrl: './registrar-incidencia-modal.component.html',
  styleUrls: ['./registrar-incidencia-modal.component.scss'],
  standalone: true,
  // 🎯 ¡SOLUCIÓN CONCEDIDA! Eliminamos IonicModule para evitar la duplicidad
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonNote,
    IonSpinner,
    IonIcon
]
})
export class RegistrarIncidenciaModalComponent implements OnInit {
  
  @Input() empleadoData!: any;
  incidenciaForm!: FormGroup;
  isSaving = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private incidenciasService: IncidenciasService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // 🇲🇽 OBTENER LA FECHA LOCAL EXACTA
    const date = new Date();
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    
    const hoy = `${anio}-${mes}-${dia}`; 

    this.incidenciaForm = this.fb.group({
      tipo: ['', Validators.required],
      fecha: [hoy, Validators.required], 
      cantidad_horas: ['', [Validators.required, Validators.min(0), Validators.max(24)]],
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.incidenciaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const horasControl = this.incidenciaForm.get('cantidad_horas');
      if (tipo === 'RETARDO') {
        horasControl?.setValue(1);
      } else if (tipo === 'HORA_EXTRA') {
        horasControl?.setValue(2);
      } else {
        horasControl?.setValue(8);
      }
    });
  }

  guardar() {
    if (this.incidenciaForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const formValues = this.incidenciaForm.value;

    let supervisorId = 
      localStorage.getItem('admin_empleado_id') || 
      localStorage.getItem('admin_id') || 
      localStorage.getItem('admin_usuario_id') || 
      localStorage.getItem('user_id') || '';

    if (!supervisorId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          
          if (uuidRegex.test(value.trim()) && !key.includes('tenant') && !key.includes('sucursal')) {
            supervisorId = value.trim();
            console.log(`🎯 ID Supervisor encontrado dinámicamente en la llave [${key}]:`, supervisorId);
            break;
          }
          
          if (value.startsWith('{') && value.endsWith('}')) {
            try {
              const parsed = JSON.parse(value);
              const posibleId = parsed.id || parsed.empleado_id || parsed.usuario_id || parsed.id_usuario;
              if (posibleId && uuidRegex.test(posibleId)) {
                supervisorId = posibleId;
                console.log(`🎯 ID Supervisor extraído de objeto JSON en [${key}]:`, supervisorId);
                break;
              }
            } catch (e) {
              // Ignore smoothly
            }
          }
        }
      }
    }

    if (!supervisorId) {
      this.mostrarToast('Error: No se detectó la sesión del supervisor', 'danger');
      console.log("📂 Contenido actual del LocalStorage para depurar:", { ...localStorage });
      this.isSaving = false;
      return;
    }

    const payload: IncidenciaPayload = {
      tenant_id: this.empleadoData.tenant_id,
      empleado_id: this.empleadoData.id,
      tipo: formValues.tipo,
      fecha: formValues.fecha,
      cantidad_horas: Number(formValues.cantidad_horas),
      motivo: formValues.motivo,
      aprobado_por: supervisorId 
    };
    
    this.incidenciasService.crearIncidencia(payload).subscribe({
      next: (res) => {
        this.mostrarToast('¡Incidencia registrada correctamente! ', 'success');
        this.modalCtrl.dismiss(res, 'confirm');
      },
      error: (err) => {
        console.error("Error al guardar incidencia:", err);
        this.isSaving = false;
        this.mostrarToast('Error al registrar la incidencia en el servidor', 'danger');
      }
    });
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
   cerrar() {
    this.modalCtrl.dismiss();
  }
}