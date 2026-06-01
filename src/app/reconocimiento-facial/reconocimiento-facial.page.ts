import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
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
  iaInicializada = false;
  mediaStream: MediaStream | null = null;
  empleadoIdentificado: EmpleadoIdentificado | null = null;
  
  // Controladores de flujo interactivo
  public buscando: boolean = false; 
  private scoreConfianzaActual = 0;
  private timerResetUI: any;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;

  constructor(
    private empleadosService: EmpleadosService,
    private toastCtrl: ToastController
  ) { }

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
    
    // ⏳ Variables de control para el auto-reinicio por abandono
    let framesSinDeteccion = 0;
    const umbralFrames = 15; // ~3 segundos de tolerancia a 200ms por frame

    const procesarFrame = async () => {
      const videoEsValido = video && video.readyState === 4;
      
      if (!videoEsValido || !this.iaInicializada) {
        setTimeout(procesarFrame, 500);
        return;
      }

      const detection = await faceapi.detectSingleFace(video, opciones)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      const displaySize = { width: video.clientWidth, height: video.clientHeight };
      faceapi.matchDimensions(canvas, displaySize);
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        // ✨ Si hay un rostro presente, reiniciamos el contador de abandono
        framesSinDeteccion = 0;

        // Dibujamos el recuadro morado institucional de la IA
        const resizedDetections = faceapi.resizeResults(detection, displaySize);
        if (ctx) {
          ctx.strokeStyle = '#a78bfa';
          ctx.lineWidth = 3;
        }
        faceapi.draw.drawDetections(canvas, resizedDetections);

        // Si la pantalla ya está congelada con un empleado, no volvemos a llamar al servicio
        if (this.empleadoIdentificado) {
          setTimeout(procesarFrame, 200);
          return;
        }

        if (!this.buscando) {
          this.buscando = true;
          this.scoreConfianzaActual = detection.detection.score;

          this.empleadosService.reconocer(Array.from(detection.descriptor)).subscribe({
            next: (empleado: EmpleadoIdentificado) => {
              this.empleadoIdentificado = empleado;
            },
            error: () => {
              this.buscando = false;
            }
          });
        }
      } else {
        // 📉 CASO CONTRARIO: No hay ningún rostro en la cámara
        if (this.empleadoIdentificado) {
          framesSinDeteccion++;
          
          // Si pasa el tiempo límite sin detectar a nadie, limpiamos el kiosco automáticamente
          if (framesSinDeteccion >= umbralFrames) {
            console.log("🔄 Kiosco abandonado. Aplicando auto-limpieza...");
            this.resetearPantallaKiosco();
            framesSinDeteccion = 0;
          }
        }
      }
      
      setTimeout(procesarFrame, 200);
    };
    procesarFrame();
  }
  // 🔥 NUEVA FUNCIÓN: Envía el evento seleccionado al Backend
  registrarEvento(tipo: 'ENTRADA' | 'INICIO_ALMUERZO' | 'FIN_ALMUERZO' | 'SALIDA') {
    if (!this.empleadoIdentificado) return;

    const ahora = new Date();
    const fechaStr = ahora.toISOString().split('T')[0];
    const horaStr = ahora.toTimeString().split(' ')[0];

    // Construimos el DTO mapeado a tu CreateAsistenciaDto del Backend
    const asistenciaPayload = {
      tenant_id: this.empleadoIdentificado.tenant_id, // Asegúrate de enviarlo desde el modelo de reconocer
      empleado_id: this.empleadoIdentificado.id,
      fecha: fechaStr,
      tipo_evento: tipo,
      hora: horaStr,
      metodo_validacion: 'FACIAL',
      score_confianza_ia: parseFloat(this.scoreConfianzaActual.toFixed(2))
    };

    // Consumimos el endpoint POST base de asistencias que ya tenías creado
    this.empleadosService.guardarAsistencia(asistenciaPayload).subscribe({
      next: () => {
        this.mostrarToast(`¡${tipo} registrado con éxito con éxito! 🎉`, 'success');
        this.resetearPantallaKiosco();
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al registrar la asistencia en el servidor', 'danger');
        this.resetearPantallaKiosco();
      }
    });
  }

  // Limpia el panel de información y reactiva la cámara del Kiosco
  private resetearPantallaKiosco() {
    this.empleadoIdentificado = null;
    this.buscando = false;
    this.scoreConfianzaActual = 0;
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  ngOnDestroy() {
    this.detenerCamara();
    if (this.timerResetUI) clearTimeout(this.timerResetUI);
  }

  detenerCamara() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
    }
  }
}