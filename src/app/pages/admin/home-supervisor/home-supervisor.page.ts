import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonCard, 
  IonCardHeader, 
  IonIcon, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonBadge
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { AuthService } from 'src/app/services/auth';
import { addIcons } from 'ionicons';
import { peopleOutline, scanOutline, logOutOutline, timeOutline, cashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home-supervisor',
  templateUrl: './home-supervisor.page.html',
  styleUrls: ['./home-supervisor.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonIcon, IonCardTitle, IonCardContent, IonButton, IonBadge,
    CommonModule, FormsModule, RouterModule, AppHeaderComponent
  ]
})
export class HomeSupervisorPage implements OnInit {

  nombreSupervisor: string = '';
  puestoSupervisor: string = '';
  sucursalId: string = '';

  constructor(private authService: AuthService, private router: Router) {
    // ✨ Registramos los iconos específicos para la operación del supervisor
    addIcons({peopleOutline,timeOutline,cashOutline,scanOutline,logOutOutline,});
  }

  ngOnInit() {
    // Extraemos la información de la sesión inyectada en el login
    this.nombreSupervisor = localStorage.getItem('admin_user') || 'Supervisor';
    this.sucursalId = this.authService.getSucursalId() || '';
    
    // Podríamos recuperar el puesto de forma estática o del almacenamiento si se requiere
    this.puestoSupervisor = 'Supervisor de Sucursal';
  }

  cerrarSesion() {
    this.authService.logout();
  }
}