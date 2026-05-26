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
  private buscando: boolean = false;
  iaInicializada = false;
  mediaStream: MediaStream | null = null;
  empleadoIdentificado: EmpleadoIdentificado | null = null;
  private idEmpleadoMostrado: string | null = null;
  private framesSinDeteccion = 0;
  private umbralFrames = 10;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;

  constructor(private empleadosService: EmpleadosService) { }

  async ngOnInit() {
    await this.cargarModelosIA();
    await this.iniciarCamara();
  }

  async cargarModelosIA() {
    const rutaModelos = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(rutaModelos);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(rutaModelos);
      await faceapi.nets.faceRecognitionNet.loadFromUri(rutaModelos);
      this.iaInicializada = true;
      console.log("✅ IA Lista");
    } catch (e) {
      console.error("❌ Fallo IA:", e);
    }
  }

 async iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user', width: 640, height: 480 } 
    });
    
    const video = this.videoElement.nativeElement;
    video.srcObject = stream;
    this.mediaStream = stream;

    // ✨ CORRECCIÓN CRÍTICA: Esperar a que el video cargue los datos antes de darle play
    video.onloadedmetadata = () => {
      video.play().catch(e => console.error("Error al iniciar video:", e));
    };
  } catch (error) {
    console.error("❌ Error al acceder a la cámara:", error);
  }
}
async onVideoPlay() {
  const video = this.videoElement.nativeElement;
  const canvas = this.canvasElement.nativeElement;
  const opciones = new faceapi.TinyFaceDetectorOptions({ inputSize: 224 });

  const procesarFrame = async () => {
    // 1. Validación de estado del video
    const videoEsValido = video && video.readyState === 4;
    if (!videoEsValido || !this.iaInicializada) {
      setTimeout(procesarFrame, 1000);
      return;
    }

    // 2. Detección
    const detection = await faceapi.detectSingleFace(video, opciones)
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    // 3. Configuración del Canvas para dibujar
    const displaySize = { width: video.clientWidth, height: video.clientHeight };
    faceapi.matchDimensions(canvas, displaySize);
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height); // Limpiamos canvas

    if (detection) {
      this.framesSinDeteccion = 0;

      // ✨ DIBUJAR EL CUADRO (Solo los 2 argumentos permitidos)
      const resizedDetections = faceapi.resizeResults(detection, displaySize);
      if (ctx) {
        ctx.strokeStyle = '#a78bfa'; // Color morado institucional
        ctx.lineWidth = 3;
      }
      faceapi.draw.drawDetections(canvas, resizedDetections);

      // 4. Lógica de reconocimiento
      if (!this.buscando) {
        this.buscando = true;
        this.empleadosService.reconocer(Array.from(detection.descriptor)).subscribe({
          next: (empleado: EmpleadoIdentificado) => {
            if (this.idEmpleadoMostrado !== empleado.curp) {
              this.empleadoIdentificado = empleado;
              this.idEmpleadoMostrado = empleado.curp;
            }
            this.buscando = true;
          },
          error: () => this.buscando = false
        });
      }
    } else {
      // 5. Limpieza si no hay rostro
      this.framesSinDeteccion++;
      if (this.framesSinDeteccion >= this.umbralFrames) {
        this.empleadoIdentificado = null;
        this.idEmpleadoMostrado = null;
        this.buscando = false;
        this.framesSinDeteccion = 0;
      }
    }
    
    setTimeout(procesarFrame, 200);
  };
  procesarFrame();
}

  ngOnDestroy() {
    this.detenerCamara();
  }

  detenerCamara() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
    }
  }
}