import { Component, HostListener, OnInit } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { FormsModule } from '@angular/forms';
    import { RouterModule } from '@angular/router'; // 👈 Necesario para routerLink
    import { 
      IonContent, 
      IonHeader, 
      IonTitle, 
      IonToolbar, 
      IonMenu, 
      IonList, 
      IonItem, 
      IonIcon, 
      IonMenuToggle, 
      IonButtons, 
      IonMenuButton, 
      IonRouterOutlet,
      IonLabel, IonGrid, IonRow } from '@ionic/angular/standalone';
    import { addIcons } from 'ionicons'; // 👈 Para registrar los iconos que usamos
    import { businessOutline, gitBranchOutline, peopleOutline, logOutOutline, exitOutline } from 'ionicons/icons';
  import { AuthService } from 'src/app/services/auth';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";

    @Component({
              selector: 'app-dashboard',
              templateUrl: './dashboard.page.html',
              styleUrls: ['./dashboard.page.scss'],
              standalone: true,
              imports: [IonRow, IonGrid, 
            CommonModule,
            FormsModule,
            RouterModule, // 👈 Lo agregamos a los imports
            IonContent,
            IonHeader,
            IonTitle,
            IonToolbar,
            IonMenu,
            IonList,
            IonItem,
            IonIcon,
            IonMenuToggle,
            IonButtons,
            IonMenuButton,
            IonRouterOutlet,
            IonLabel,
            AppHeaderComponent
        ]
            })
    export class DashboardPage implements OnInit {

      constructor(private authService: AuthService,) {
        // Registramos los iconos para que Ionic standalone los renderice bien
  addIcons({businessOutline,gitBranchOutline,peopleOutline,logOutOutline,exitOutline});    }

    // ✨ Detecta cualquier clic en la página para resetear los 15 minutos
  @HostListener('document:click')
  @HostListener('document:keydown')
  resetTimer() {
    this.authService.resetInactivityTimer();
  }

  ngOnInit() {
    this.authService.resetInactivityTimer(); // Inicia el conteo al entrar
  }
      // Añade este método:
  logout() {
    this.authService.logout();
  }
  pageTitle: string = 'Panel de Control';

    onActivate(event: any) {
      // Detectamos qué página se acaba de cargar
      if (event.constructor.name === 'EmpresasPage') {
        this.pageTitle = 'Gestión de Empresas';
      } else if (event.constructor.name === 'SucursalesPage') {
        this.pageTitle = 'Gestión de Sucursales';
      } else if (event.constructor.name === 'EmpleadosPage') {
        this.pageTitle = 'Gestión de Empleados';
      } else {
        this.pageTitle = 'Panel de Control Super Admin';
      }
    }
    }