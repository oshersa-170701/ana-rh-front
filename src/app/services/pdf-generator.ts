import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NominaDetalleResponse, NominaResponse } from '../models1/nomina.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  /**
   * 📑 Genera y descarga el PDF del recibo de nómina dinámico por Empresa / Tenant
   * @param nomina Cabecera global del período
   * @param detalle Renglón específico con los cálculos del empleado
   * @param empresa Objeto opcional con los metadatos de la empresa actual del Tenant
   */
  generarReciboEmpleado(
    nomina: NominaResponse, 
    detalle: NominaDetalleResponse, 
    empresa?: { nombre: string; logo_url?: string }
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const emp = detalle.empleado;
    const folio = detalle.id.substring(0, 8).toUpperCase();
    const periodoStr = `${this.formatearFecha(nomina.periodo_inicio)} al ${this.formatearFecha(nomina.periodo_fin)}`;
    
    // 🏢 Nombre dinámico de la empresa con fallback al corporativo base
    const nombreEmpresa = empresa?.nombre ;

    // --- 🎨 ENCABEZADO INSTITUCIONAL ---
    doc.setFillColor(30, 41, 59); // #1e293b
    doc.rect(0, 0, 216, 35, 'F');

    // 📐 Control de coordenadas X para los textos si existe un logotipo
    let textoX = 14; 

    if (empresa?.logo_url) {
      try {
        // Añadimos el logo (Soporta Base64, imágenes locales o URLs expuestas)
        // Coordenadas: X=14, Y=5, Ancho=25mm, Alto=25mm (Mantiene un espacio cuadrado estético)
        doc.addImage(empresa.logo_url, 'PNG', 14, 5, 25, 25);
        textoX = 44; // Recorremos el texto a la derecha para que no se encime con el logo
      } catch (error) {
        console.error('No se pudo cargar el logotipo en el PDF:', error);
        textoX = 14; // Fallback por si la imagen se cae o está corrupta
      }
    }

    // Textos del Encabezado con posición dinámica
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20); // Bajamos a 20 para que nombres de empresas largos quepan bien
   doc.text((nombreEmpresa || 'Sistema de Gestión por defecto').toUpperCase(), textoX, 18);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Sistema Automatizado de Control de Asistencias y Nómina', textoX, 25);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`RECIBO DE NÓMINA`, 150, 18);
    doc.setFont('Helvetica', 'normal');
    doc.text(`FOLIO: #NZ-${folio}`, 150, 25);

    // --- 👤 DATOS DEL TRABAJADOR ---
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INFORMACIÓN DEL EMPLEADO', 14, 48);

    doc.setDrawColor(192, 132, 252);
    doc.setLineWidth(0.5);
    doc.line(14, 50, 202, 50);

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text('Nombre completo:', 14, 58);
    doc.text('Puesto:', 14, 64);
    doc.text('CURP:', 14, 70);

    doc.setFont('Helvetica', 'normal');
    doc.text(`${emp?.nombre_completo || 'N/A'}`, 48, 58);
    doc.text(`${emp?.puesto || 'Colaborador General'}`, 48, 64);
    doc.text(`${emp?.curp || 'N/A'}`, 48, 70);

    doc.setFont('Helvetica', 'bold');
    doc.text('Período de Pago:', 120, 58);
    doc.text('Días Laborados:', 120, 64);
    doc.text('Salario Diario:', 120, 70);

    doc.setFont('Helvetica', 'normal');
    doc.text(periodoStr, 152, 58);
    doc.text(`${detalle.dias_asistidos} días`, 152, 64);
    doc.text(`$${Number(emp?.salario_diario || 0).toFixed(2)} MXN`, 152, 70);

    // --- 📊 TABLA FINANCIERA DE CONCEPTOS ---
    doc.setFont('Helvetica', 'bold');
    doc.text('DESGLOSE DE PERCEPCIONES Y DEDUCCIONES', 14, 84);

    const columnas = ['CONCEPTO', 'PERCEPCIONES', 'DEDUCCIONES'];
    
    const filas = [
      ['Sueldo Base Ordinario', `$${Number(detalle.pago_base).toFixed(2)}`, '$0.00'],
      ['Horas Extra Totales (' + detalle.horas_extra + ' hrs)', `$${Number(detalle.pago_horas_extra).toFixed(2)}`, '$0.00'],
      ['Faltas e Incidencias Registradas (' + detalle.faltas + ')', '$0.00', '$0.00'],
    ];

    autoTable(doc, {
      startY: 87,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { font: 'Helvetica', fontSize: 9, cellPadding: 4 }, 
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });

    // --- 💰 TOTAL NETO RECIBIDO ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFillColor(248, 250, 252); 
    doc.rect(120, finalY, 82, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(120, finalY, 82, 12, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL NETO RECIBIDO:', 124, finalY + 7);
    
    const totalNetoNumerico = Number(detalle.total_neto) || 0;
    doc.text(`$${totalNetoNumerico.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 172, finalY + 7);

    // --- 🖋️ SECCIÓN DE FIRMA DE CONFORMIDAD ---
    const firmaY = finalY + 45;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(68, firmaY, 148, firmaY); 

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.text('Firma de Conformidad del Empleado', 108, firmaY + 5, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Manifiesto estar de acuerdo con los días laborados y montos netos descritos en este comprobante.', 108, firmaY + 10, { align: 'center' });

    // --- 💾 DESCARGA AUTOMÁTICA DEL ARCHIVO ---
    const nombreArchivo = `Recibo_${emp?.nombre_completo.replace(/\s+/g, '_')}_Folio_${folio}.pdf`;
    doc.save(nombreArchivo);
  }

  private formatearFecha(fechaStr: string): string {
    const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };
    return new Date(fechaStr).toLocaleDateString('es-MX', opciones);
  }
}