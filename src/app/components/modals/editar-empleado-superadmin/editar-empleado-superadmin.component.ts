import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline, businessOutline, gitBranchOutline, saveOutline, storefrontOutline, closeOutline } from 'ionicons/icons';
import { Empresa, Empresas } from 'src/app/services/empresas';
import { SucursalesService, Sucursal } from 'src/app/services/sucursales';

@Component({
  selector: 'app-editar-empleado-superadmin',
  templateUrl: './editar-empleado-superadmin.component.html',
  styleUrls: ['./editar-empleado-superadmin.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditarEmpleadoSuperadminComponent implements OnInit {
  
  @Input() empleadoData!: any;

  empleadoForm!: FormGroup;
  isSaving = false;

  // ✨ Referencias y variables añadidas para el control de la imagen
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  selectedFile: Blob | null = null;
  imagePreview: string | null = null;

  empresasActivas: Empresa[] = [];
  sucursalesTodas: Sucursal[] = [];
  sucursalesFiltradas: Sucursal[] = [];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private empresasService: Empresas,
    private sucursalesService: SucursalesService,
    private toastCtrl: ToastController
  ) {
    addIcons({ cameraOutline, trashOutline, businessOutline, gitBranchOutline, saveOutline,storefrontOutline,closeOutline});
  }

  ngOnInit() {
    this.empleadoForm = this.fb.group({
      tenant_id: ['', Validators.required],
      sucursal_id: ['', Validators.required],
      nombre_completo: ['', Validators.required],
      curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      nss: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      salario_diario: ['', [Validators.required, Validators.min(1)]],
      puesto: ['', Validators.required],
      user: ['', [Validators.minLength(4)]],
      password_hash: [''], 
      estatus: [true, Validators.required]
    });

    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.empresasService.getEmpresas().subscribe({
      next: (empresas) => {
        this.empresasActivas = empresas.filter(e => e.estatus === true);
        
        this.sucursalesService.getSucursales().subscribe({
          next: (sucursales) => {
            this.sucursalesTodas = sucursales;
            this.mapearDatosFormulario();
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }

  mapearDatosFormulario() {
    if (!this.empleadoData) return;

    this.sucursalesFiltradas = this.sucursalesTodas.filter(
      s => s.tenant_id === this.empleadoData.tenant_id
    );

    this.empleadoForm.patchValue({
      tenant_id: this.empleadoData.tenant_id,
      sucursal_id: this.empleadoData.sucursal_id,
      nombre_completo: this.empleadoData.nombre_completo,
      curp: this.empleadoData.curp,
      nss: this.empleadoData.nss,
      salario_diario: this.empleadoData.salario_diario,
      puesto: this.empleadoData.puesto,
      user: this.empleadoData.user,
      password_hash: '', 
      estatus: this.empleadoData.estatus
    });

    // ✨ PRECARGA DE IMAGEN: Si el empleado tiene una foto previa en el back, la apuntamos al preview
    if (this.empleadoData.foto_perfil_url) {
      this.imagePreview = `http://localhost:3000/${this.empleadoData.foto_perfil_url}`;
    }
  }

  // Métodos de interacción con el archivo de la cámara/galería
  activarCamara() { 
    this.fileInput.nativeElement.click(); 
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

  eliminarFoto(event: Event) {
    event.stopPropagation();
    this.imagePreview = null;
    this.selectedFile = null;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = ''; 
    }
  }

  onEmpresaChange(event: any) {
    const tenantId = event.detail.value;
    const sucursalCtrl = this.empleadoForm.get('sucursal_id');

    if (tenantId) {
      this.sucursalesFiltradas = this.sucursalesTodas.filter(s => s.tenant_id === tenantId);
      sucursalCtrl?.setValue('');
    } else {
      this.sucursalesFiltradas = [];
      sucursalCtrl?.setValue('');
    }
  }

  async guardar() {
    if (this.empleadoForm.invalid) return;

    this.isSaving = true;

    // Usaremos un FormData o un objeto dinámico para retornar los datos limpios.
    // Como en tu página principal haces el updateEmpleado con un objeto plano de JSON,
    // pasaremos una propiedad "nuevaFoto" por si decide procesarse el archivo binario.
    const datosModificados = { 
      ...this.empleadoForm.value,
      nuevaFoto: this.selectedFile // Viajará en nulo si no se modificó la imagen
    };

    if (!datosModificados.password_hash || datosModificados.password_hash.trim() === '') {
      delete datosModificados.password_hash;
    }

    this.modalCtrl.dismiss(datosModificados, 'confirm');
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
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