import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonGrid, 
  IonCol, 
  IonRow, 
  IonCard, 
  IonCardHeader, 
  IonIcon, 
  IonCardTitle, 
  IonCardContent 
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";

// ✨ 1. IMPORTAMOS las funciones y el icono específico que necesitas de Ionicons
import { addIcons } from 'ionicons';
import { storefrontOutline } from 'ionicons/icons'; 

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.page.html',
  styleUrls: ['./home-admin.page.scss'],
  standalone: true,
  imports: [
    IonCardContent, IonCardTitle, IonIcon,
    IonCardHeader, IonCard, IonRow, IonCol, IonGrid, IonContent,
    IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, 
    RouterModule, AppHeaderComponent
  ]
})
export class HomeAdminPage implements OnInit {

  // ✨ 2. INYECTAMOS el icono en el constructor para que el HTML lo reconozca
  constructor() { 
    addIcons({ storefrontOutline });
  }

  ngOnInit() {
  }

}