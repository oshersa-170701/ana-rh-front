import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { EmpleadosService } from '../services/empleados';
import { EmpleadoIdentificado } from '../models1/empleado.interface';
import * as faceapi from 'face-api.js';


@Component({
  selector: 'app-reconocimiento-facial',
  templateUrl: './reconocimiento-facial.page.html',
  styleUrls: ['./reconocimiento-facial.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReconocimientoFacialPage implements OnInit, OnDestroy {
  modelosListos: boolean = false;
  private buscando: boolean = false;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
  mediaStream: MediaStream | null = null;

  constructor(private empleadosService: EmpleadosService) { }

 iaInicializada = false;
  
  async ngOnInit() {
    try {
      // Usamos el CDN para evitar errores de ruta local
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);

      this.iaInicializada = true;
      console.log("✅ IA Lista");
    } catch (error) {
      console.error("❌ Error de IA:", error);
    }
  }

  async cargarModelosIA() {
    const rutaModelos = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

    try {
      // ✨ CAMBIO: Ya no usamos .ready(), es la causa del error.
      // Solo configuramos el backend.
      await faceapi.tf.setBackend('cpu');

      // Cargamos los modelos.
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(rutaModelos),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(rutaModelos),
        faceapi.nets.faceRecognitionNet.loadFromUri(rutaModelos)
      ]);

      this.iaInicializada = true;
      console.log("IA Lista");
    } catch (e) {
      console.error("Fallo IA:", e);
    }
  }

  async iniciarCamara() {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.videoElement.nativeElement.srcObject = this.mediaStream;
  }

  async onVideoPlay() {
    const video = this.videoElement.nativeElement;
    const opciones = new faceapi.TinyFaceDetectorOptions({ inputSize: 224 });

    const procesarFrame = async () => {
      if (!video || video.paused || video.ended || !this.modelosListos) {
        setTimeout(procesarFrame, 500);
        return;
      }

      const detection = await faceapi.detectSingleFace(video, opciones)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (detection && !this.buscando) {
        this.buscando = true;
        this.empleadosService.reconocer(Array.from(detection.descriptor)).subscribe({
          next: (empleado) => {
            alert(`Hola ${empleado.nombre}`);
            setTimeout(() => this.buscando = false, 3000);
          },
          error: () => this.buscando = false
        });
      }
      // El setTimeout garantiza que el navegador no se bloquee
      setTimeout(procesarFrame, 100);
    };

    procesarFrame();
  }

  ngOnDestroy() { this.detenerCamara(); }
  detenerCamara() { this.mediaStream?.getTracks().forEach(t => t.stop()); }
  
}