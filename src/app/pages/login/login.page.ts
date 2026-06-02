import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon, 
  ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonIcon
  ]
})
export class LoginPage implements OnInit {
  user: string = '';
  password_hash: string = '';
  // ✨ Nueva propiedad para controlar el estado del ojo
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    // ✨ Registramos los nuevos iconos
    addIcons({ personOutline, lockClosedOutline, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // ✨ Nueva función para alternar el tipo de input
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

async onLogin() {
    if (!this.user || !this.password_hash) {
      this.showToast('Por favor, rellena todos los campos', 'warning');
      return;
    }

    // 1. Intentamos loguear primero como Superadmin global
    this.authService.loginSuperadmin(this.user, this.password_hash).subscribe({
      next: () => {
        this.showToast('¡Bienvenido Superadmin!', 'success');
        this.router.navigate(['/dashboard']); // Va a la raíz del dashboard (home-admin)
      },
      error: (err) => {
        console.log('No es Superadmin, intentando acceso como Empleado Supervisor...');
        
        // 2. Si falla el Superadmin, se intenta con las credenciales de la tabla empleados
        this.authService.loginEmpleadoAdmin(this.user, this.password_hash).subscribe({
          next: () => {
            this.showToast('¡Bienvenido, Supervisor!', 'success');
            
            // ✨ REDIRECCIÓN AL ENTORNO CORRECTO:
            this.router.navigate(['/dashboard/home-supervisor']); 
          },
          error: (empleadoErr) => {
            // 3. Si ambos fallan, mostramos el error definitivo al usuario
            const msg = empleadoErr.status === 401 || empleadoErr.status === 404 
              ? 'Credenciales incorrectas o usuario inexistente' 
              : 'Error al conectar con el servidor';
            this.showToast(msg, 'danger');
          }
        });
      }
    });
  }
  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}