import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as faceapi from 'face-api.js';
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline } from 'ionicons/icons';
import { EmpleadosService } from 'src/app/services/empleados';
@Component({
  selector: 'app-add-empleado-modal',
  templateUrl: './add-empleado-modal.component.html',
  standalone: true,
  styleUrls: ['./add-empleado-modal.component.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class AddEmpleadoModalComponent {
  isModelLoaded = false;
  empleadoForm: FormGroup;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  selectedFile: Blob | null = null;
  imagePreview: string | null = null;
  isSaving = false; // ✨ Nueva variable de control
  listaSucursales: any[] = [];
  constructor(private modalCtrl: ModalController, private fb: FormBuilder, private empleadosService: EmpleadosService, private toastCtrl: ToastController) {
    addIcons({ cameraOutline, trashOutline });
    // 🏢 Recuperamos los datos descriptivos de la sesión para mostrarlos
    const empresaReal = localStorage.getItem('admin_empresa_nombre') || 'Cargando Empresa...';
    const sucursalReal = localStorage.getItem('admin_sucursal_nombre') || 'Cargando Sucursal...';
    this.empleadoForm = this.fb.group({
      // ✨ Agregamos los controles precargados al Formulario Reactivo
      // Se muestran congelados en la vista con los nombres reales
      tenant_id: [empresaReal, Validators.required],
      sucursal_id: ['', Validators.required],
      nombre_completo: ['', Validators.required],
      curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      nss: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      salario_diario: ['', [Validators.required, Validators.min(1)]],
      puesto: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.obtenerSedesDelSupervisor();
    try {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      this.isModelLoaded = true;
    } catch (e) {
      this.mostrarToast('Error cargando IA', 'danger');
    }
  }
  obtenerSedesDelSupervisor() {
    const miEmpresaID = localStorage.getItem('admin_tenant_id') || '';
    
    if (miEmpresaID) {
      this.empleadosService.getSucursalesByTenant(miEmpresaID).subscribe({
        next: (sedes) => {
          this.listaSucursales = sedes;
          
          // Opcional: Si solo tiene una sucursal asignada, la preseleccionamos automáticamente
          if (this.listaSucursales.length === 1) {
            this.empleadoForm.get('sucursal_id')?.setValue(this.listaSucursales[0].id);
          }
        },
        error: (err) => {
          console.error('Error al descargar sucursales:', err);
          this.mostrarToast('No se pudieron cargar las sedes de trabajo', 'danger');
        }
      });
    }
  }
  async cargarModelos() {
    // Estas rutas funcionan si moviste tus modelos a la carpeta /public/models
    const MODEL_URL = '/models';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log("Modelos cargados");
  }
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.imagePreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

async confirmar() {
    if (this.empleadoForm.valid && this.selectedFile && !this.isSaving) {
      this.isSaving = true;
      try {
        const imgElement = await faceapi.bufferToImage(this.selectedFile as any);
        const detection = await faceapi.detectSingleFace(imgElement)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          this.mostrarToast('No se detectó un rostro claro', 'warning');
          this.isSaving = false;
          return;
        }

        const formData = new FormData();
        
        // Pasamos todos los datos del formulario (esto ya incluye el sucursal_id seleccionado en el combobox)
        Object.keys(this.empleadoForm.value).forEach(key => {
          if (key !== 'tenant_id') {
            formData.append(key, this.empleadoForm.value[key]);
          }
        });

        // Inyectamos el ID real de la empresa (UUID)
        const miEmpresaID = localStorage.getItem('admin_tenant_id') || '';
        formData.append('tenant_id', miEmpresaID);

        formData.append('foto', this.selectedFile, 'perfil.jpg');
        formData.append('face_embedding', JSON.stringify(Array.from(detection.descriptor)));

        this.empleadosService.crearEmpleado(formData).subscribe({
          next: () => { 
            this.mostrarToast('¡Empleado guardado exitosamente!', 'success');
            this.modalCtrl.dismiss(null, 'confirm'); 
          },
          error: (err) => {
            console.error(err);
            this.isSaving = false;
            this.mostrarToast('Error al guardar el empleado', 'danger');
          }
        });
      } catch (e) {
        console.error(e);
        this.isSaving = false;
        this.mostrarToast('Error inesperado', 'danger');
      }
    }
  }
  // ✨ Método auxiliar para mostrar Toasts
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  cancelar() { return this.modalCtrl.dismiss(); }
  activarCamara() { this.fileInput.nativeElement.click(); }
  eliminarFoto(event: Event) {
    event.stopPropagation();
    this.imagePreview = null;
    this.selectedFile = null;

    // ✨ ESTO ES LO QUE FALTA: Resetear el valor del input de archivo
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
}