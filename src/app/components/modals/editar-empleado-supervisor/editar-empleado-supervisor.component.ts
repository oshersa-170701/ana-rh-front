import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline } from 'ionicons/icons';
import { Empleado, EmpleadosService } from 'src/app/services/empleados';
import * as faceapi from 'face-api.js'; // 👈 ¡FALTA ESTA LÍNEA DE ORO!
@Component({
  selector: 'app-editar-empleado-supervisor',
  templateUrl: './editar-empleado-supervisor.component.html',
  styleUrls: ['./editar-empleado-supervisor.component.scss'], // 👈 Reutilizamos tus estilos del agregar
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditarEmpleadoSupervisorComponent implements OnInit {

  // ✨ Recibe el objeto completo enviado desde la grilla
  @Input() empleadoData!: Empleado;

  empleadoForm!: FormGroup;
  listaSucursales: any[] = [];
  isSaving = false;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  selectedFile: Blob | null = null;
  imagePreview: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private empleadosService: EmpleadosService,
    private toastCtrl: ToastController
  ) {
    addIcons({ cameraOutline, trashOutline });
  }

 async ngOnInit() {
    const empresaNombre = localStorage.getItem('admin_empresa_nombre') || 'Mi Empresa';

    // Inicializamos el formulario
    this.empleadoForm = this.fb.group({
      tenant_id: [empresaNombre, Validators.required],
      sucursal_id: [this.empleadoData.sucursal_id, Validators.required],
      nombre_completo: [this.empleadoData.nombre_completo, Validators.required],
      curp: [this.empleadoData.curp, [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      nss: [this.empleadoData.nss, [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      salario_diario: [this.empleadoData.salario_diario, [Validators.required, Validators.min(1)]],
      puesto: [this.empleadoData.puesto, Validators.required]
    });
if (this.empleadoData.foto_perfil_url) {
      this.imagePreview = `http://localhost:3000/${this.empleadoData.foto_perfil_url}`;
    } else {
      this.imagePreview = null; // Placeholder si no tiene foto
    }

    this.obtenerSedesDelSupervisor();

    // ✨ CARGA DE MODELOS: Por seguridad para que face-api funcione al cambiar la foto
    try {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    } catch (e) {
      console.error('Error cargando modelos de IA en edición:', e);
    }
  }

  obtenerSedesDelSupervisor() {
    const miEmpresaID = localStorage.getItem('admin_tenant_id') || '';
    if (miEmpresaID) {
      this.empleadosService.getSucursalesByTenant(miEmpresaID).subscribe({
        next: (sedes) => {
          this.listaSucursales = sedes;
        },
        error: (err) => {
          console.error(err);
          this.mostrarToast('Error al cargar sedes de trabajo', 'danger');
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.imagePreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

async confirmar() {
    if (this.empleadoForm.valid && !this.isSaving) {
      this.isSaving = true;

      try {
        const formData = new FormData();

        // Mapeamos formulario reactivo al FormData
        Object.keys(this.empleadoForm.value).forEach(key => {
          if (key !== 'tenant_id') {
            formData.append(key, this.empleadoForm.value[key]);
          }
        });

        // Aseguramos tenant_id real
        const miEmpresaID = localStorage.getItem('admin_tenant_id') || '';
        formData.append('tenant_id', miEmpresaID);

        // ✨ CORRECCIÓN 2: Gestión Inteligente de Fotos
        if (this.selectedFile) {
          // ESCENARIO A: Se seleccionó una foto nueva -> Analizar rostro y mandar archivo
          const imgElement = await faceapi.bufferToImage(this.selectedFile as any);
          const detection = await faceapi.detectSingleFace(imgElement)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection) {
            this.mostrarToast('No se detectó un rostro claro', 'warning');
            this.isSaving = false;
            return;
          }

          formData.append('foto', this.selectedFile, 'perfil.jpg');
          formData.append('face_embedding', JSON.stringify(Array.from(detection.descriptor)));

        } else if (this.imagePreview && this.empleadoData.face_embedding) {
          // ESCENARIO B: No hay foto nueva, pero se mantiene la actual -> Mandar embedding previo para no borrarla
          formData.append('face_embedding', typeof this.empleadoData.face_embedding === 'string' 
            ? this.empleadoData.face_embedding 
            : JSON.stringify(this.empleadoData.face_embedding)
          );
        }
        // ESCENARIO C: imagePreview es nulo -> Se eliminó la foto, el backend debe borrarla

        // Enviamos la petición PATCH al backend
        this.empleadosService.updateEmpleado(this.empleadoData.id!, formData).subscribe({
          next: (res) => {
            this.mostrarToast('¡Colaborador actualizado con éxito! 🎉', 'success');
            this.modalCtrl.dismiss(res, 'confirm'); 
          },
          error: (err) => {
            console.error('Error al actualizar en NestJS:', err);
            this.isSaving = false;
            this.mostrarToast('Error al actualizar datos en el servidor', 'danger');
          }
        });

      } catch (e) {
        console.error('Error en proceso de IA:', e);
        this.isSaving = false;
        this.mostrarToast('Error inesperado al procesar datos', 'danger');
      }
    }
  }
  cancelar() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  activarCamara() {
    this.fileInput.nativeElement.click();
  }

  eliminarFoto(event: Event) {
    event.stopPropagation();
    this.imagePreview = null;
    this.selectedFile = null;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onCurpInput(event: any) {
    const valor = event.target.value.toUpperCase();
    this.empleadoForm.get('curp')?.setValue(valor, { emitEvent: false });
  }

  onNombreInput(event: any) {
    const valor = event.target.value.toUpperCase();
    this.empleadoForm.get('nombre_completo')?.setValue(valor, { emitEvent: false });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}