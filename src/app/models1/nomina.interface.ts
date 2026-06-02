import { AsistenciaResponse } from '../services/asistencias'; // Por si la ocupas después

export enum EstatusNomina {
  BORRADOR = 'BORRADOR',
  TIMBRADA = 'TIMBRADA',
  PAGADA = 'PAGADA'
}

// 👤 Estructura para el empleado vinculado dentro de los detalles
export interface EmpleadoDetalleNomina {
  id: string;
  nombre_completo: string;
  puesto: string;
  salario_diario: number;
  foto_perfil_url?: string;
  curp: string;
  nss?: string;
}

// 📑 Estructura para cada renglón histórico de la tabla nominas_detalles
export interface NominaDetalleResponse {
  id: string;
  nomina_id: string;
  empleado_id: string;
  dias_asistidos: number;
  faltas: number;
  horas_extra: number;
  pago_base: number;
  pago_horas_extra: number;
  total_neto: number;
  created_at: string;
  empleado?: EmpleadoDetalleNomina; // 🔥 Objeto inyectado por la relación de NestJS
}

// 📅 Estructura principal de la Nómina (Cabecera Global)
export interface NominaResponse {
  id: string;
  tenant_id: string;
  periodo_inicio: string;
  periodo_fin: string;
  estatus: EstatusNomina;
  created_at: string;
  detalles?: NominaDetalleResponse[]; // 🔥 Arreglo con todos los pagos calculados
}