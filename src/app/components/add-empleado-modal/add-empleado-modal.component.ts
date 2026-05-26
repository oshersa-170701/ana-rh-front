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
  constructor(private modalCtrl: ModalController, private fb: FormBuilder, private empleadosService: EmpleadosService,private toastCtrl: ToastController) {
    addIcons({ cameraOutline, trashOutline });
    this.empleadoForm = this.fb.group({
      nombre_completo: ['', Validators.required],
      curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      nss: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      salario_diario: ['', [Validators.required, Validators.min(1)]],
      puesto: ['', Validators.required]
    });
  }
async ngOnInit() {
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
        Object.keys(this.empleadoForm.value).forEach(key => formData.append(key, this.empleadoForm.value[key]));
        formData.append('foto', this.selectedFile, 'perfil.jpg');
        formData.append('face_embedding', JSON.stringify(Array.from(detection.descriptor)));

        this.empleadosService.crearEmpleado(formData).subscribe({
          next: () => { 
            this.mostrarToast('¡Empleado guardado exitosamente!', 'success'); // ✨ Toast éxito
            this.modalCtrl.dismiss(); 
          },
          error: (err) => {
            console.error(err);
            this.isSaving = false;
            this.mostrarToast('Error al guardar el empleado', 'danger'); // ✨ Toast error
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