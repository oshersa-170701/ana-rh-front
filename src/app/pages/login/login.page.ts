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
// ✨ Importamos los nuevos iconos del ojo
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

    this.authService.login(this.user, this.password_hash).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: async (err) => {
        const msg = err.status === 401 ? 'Credenciales incorrectas' : 'Error al conectar con el servidor';
        this.showToast(msg, 'danger');
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