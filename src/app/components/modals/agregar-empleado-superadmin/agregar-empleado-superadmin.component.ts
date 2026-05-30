import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as faceapi from 'face-api.js';
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline, businessOutline, gitBranchOutline } from 'ionicons/icons';
import { EmpleadosService } from 'src/app/services/empleados';
import {  Empresa, Empresas } from 'src/app/services/empresas'; 
import { SucursalesService, Sucursal } from 'src/app/services/sucursales';

@Component({
  selector: 'app-agregar-empleado-superadmin',
  templateUrl: './agregar-empleado-superadmin.component.html',
  styleUrls: ['./agregar-empleado-superadmin.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class AgregarEmpleadoSuperadminComponent implements OnInit {

  isModelLoaded = false;
  empleadoForm: FormGroup;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  selectedFile: Blob | null = null;
  imagePreview: string | null = null;
  isSaving = false;

  // Colecciones para los selectores dinámicos
  empresasActivas: Empresa[] = [];
  sucursalesTodas: Sucursal[] = [];
  sucursalesFiltradas: Sucursal[] = [];

  constructor(
    private modalCtrl: ModalController, 
    private fb: FormBuilder, 
    private empleadosService: EmpleadosService,
    private empresasService: Empresas,
    private sucursalesService: SucursalesService,
    private toastCtrl: ToastController
  ) {
    addIcons({ cameraOutline, trashOutline, businessOutline, gitBranchOutline });
    
    // Configuración del formulario con credenciales obligatorias para este rol alto
    this.empleadoForm = this.fb.group({
      tenant_id: ['', Validators.required],
      sucursal_id: [{ value: '', disabled: true }, Validators.required], // Se habilita al elegir empresa
      nombre_completo: ['', Validators.required],
      curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      nss: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      salario_diario: ['', [Validators.required, Validators.min(1)]],
      puesto: ['', Validators.required],
      user: ['', [Validators.required, Validators.minLength(4)]],
      password_hash: ['', [Validators.required, Validators.minLength(6)]] // El password plano que el back encriptará
    });
  }

  async ngOnInit() {
    this.cargarDatosIniciales();

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

  cargarDatosIniciales() {
    this.empresasService.getEmpresas().subscribe({
      next: (data) => this.empresasActivas = data.filter(e => e.estatus === true),
      error: (err) => console.error('Error al cargar empresas:', err)
    });

    this.sucursalesService.getSucursales().subscribe({
      next: (data) => this.sucursalesTodas = data,
      error: (err) => console.error('Error al cargar sucursales:', err)
    });
  }

  // Escucha el cambio de empresa y filtra las sucursales pertenecientes
  onEmpresaChange(event: any) {
    const tenantId = event.detail.value;
    const sucursalCtrl = this.empleadoForm.get('sucursal_id');

    if (tenantId) {
      this.sucursalesFiltradas = this.sucursalesTodas.filter(s => s.tenant_id === tenantId);
      sucursalCtrl?.enable();
      sucursalCtrl?.setValue('');
    } else {
      this.sucursalesFiltradas = [];
      sucursalCtrl?.disable();
    }
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
        // Mapeamos todos los campos del formulario (incluyendo user y password_hash)
        Object.keys(this.empleadoForm.value).forEach(key => {
          formData.append(key, this.empleadoForm.value[key]);
        });
        
        formData.append('foto', this.selectedFile, 'perfil.jpg');
        formData.append('face_embedding', JSON.stringify(Array.from(detection.descriptor)));

        this.empleadosService.crearEmpleado(formData).subscribe({
          next: () => { 
            this.mostrarToast('¡Empleado administrador guardado exitosamente!', 'success');
            this.modalCtrl.dismiss(null, 'confirm'); 
          },
          error: (err) => {
            console.error(err);
            this.isSaving = false;
            const msg = err.error?.message || 'Error al guardar el empleado administrativo';
            this.mostrarToast(msg, 'danger');
          }
        });
      } catch (e) {
        console.error(e);
        this.isSaving = false;
        this.mostrarToast('Error inesperado', 'danger');
      }
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top', // Lo ponemos arriba para mantener el estándar visual limpio
      color: color
    });
    await toast.present();
  }

  cancelar() { return this.modalCtrl.dismiss(null, 'cancel'); }
  activarCamara() { this.fileInput.nativeElement.click(); }
  
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
}