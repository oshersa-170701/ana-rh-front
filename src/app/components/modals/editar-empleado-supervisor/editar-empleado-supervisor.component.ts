import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { cameraOutline, closeOutline, trashOutline } from 'ionicons/icons';
import { Empleado, EmpleadosService } from 'src/app/services/empleados';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-editar-empleado-supervisor',
  templateUrl: './editar-empleado-supervisor.component.html',
  styleUrls: ['./editar-empleado-supervisor.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditarEmpleadoSupervisorComponent implements OnInit {

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
    addIcons({ cameraOutline, trashOutline,closeOutline });
  }

  async ngOnInit() {
    const empresaNombre = localStorage.getItem('admin_empresa_nombre') || 'Mi Empresa';

    // ✨ CORRECCIÓN: Validamos si el estatus viene como 1/0 o true/false desde MySQL
  const estatusInicial = this.empleadoData.estatus;

    // Inicializamos el formulario reactivo incluyendo el control de estatus
    this.empleadoForm = this.fb.group({
      tenant_id: [empresaNombre, Validators.required],
      sucursal_id: [this.empleadoData.sucursal_id, Validators.required],
      nombre_completo: [this.empleadoData.nombre_completo, Validators.required],
      curp: [this.empleadoData.curp, [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      nss: [this.empleadoData.nss, [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      salario_diario: [this.empleadoData.salario_diario, [Validators.required, Validators.min(1)]],
      puesto: [this.empleadoData.puesto, Validators.required],
      estatus: [estatusInicial, Validators.required] // 👈 Recibirá un 1 o un 0 perfecto
    });

    if (this.empleadoData.foto_perfil_url) {
      this.imagePreview = `http://localhost:3000/${this.empleadoData.foto_perfil_url}`;
    } else {
      this.imagePreview = null;
    }

    this.obtenerSedesDelSupervisor();

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

        // Mapeamos los campos del formulario sanitizando valores vacíos o nulos
        Object.keys(this.empleadoForm.value).forEach(key => {
          const valor = this.empleadoForm.value[key];
          if (key !== 'tenant_id') {
            if (valor !== null && valor !== undefined && valor !== '') {
              // El campo 'estatus' se mandará automáticamente como un string "true" o "false", 
              // el cual tu backend ya sabe castear gracias a @Transform en CreateEmpleadoDto.
              formData.append(key, valor);
            }
          }
        });

        const miEmpresaID = localStorage.getItem('admin_tenant_id') || '';
        formData.append('tenant_id', miEmpresaID);

        // Gestión Inteligente de Fotos y Embeddings
        if (this.selectedFile) {
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
          formData.append('face_embedding', typeof this.empleadoData.face_embedding === 'string' 
            ? this.empleadoData.face_embedding 
            : JSON.stringify(this.empleadoData.face_embedding)
          );
        }

        this.empleadosService.updateEmpleado(this.empleadoData.id!, formData).subscribe({
          next: (res) => {
            this.mostrarToast('¡Colaborador actualizado con éxito!', 'success');
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