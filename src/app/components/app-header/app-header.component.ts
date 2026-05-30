import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonBackButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonBackButton, CommonModule]
})
export class AppHeaderComponent {
  // ✨ Reciben los valores desde la página que use el navbar
  @Input() titulo: string = 'Panel de Control';
  @Input() esHome: boolean = true; 
}