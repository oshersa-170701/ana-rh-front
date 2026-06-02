export { AsistenciaResponse } from '../services/asistencias';

export enum EstatusNomina {
  BORRADOR = 'BORRADOR',
  TIMBRADA = 'TIMBRADA',
  PAGADA = 'PAGADA'
}

// 🏢 Estructura de la empresa vinculada al Tenant
export interface EmpresaResponse {
  id: string;
 nombre: string; // 👈 ¡Cambiado de nombre_comercial a nombre!
  razon_social?: string;
  rfc?: string;
  logo_url?: string;
}

export interface EmpleadoDetalleNomina {
  id: string;
  nombre_completo: string;
  puesto: string;
  salario_diario: number;
  foto_perfil_url?: string;
  curp: string;
  nss?: string;
}

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
  empleado?: EmpleadoDetalleNomina;
}

export interface NominaResponse {
  id: string;
  tenant_id: string;
  periodo_inicio: string;
  periodo_fin: string;
  estatus: EstatusNomina;
  created_at: string;
  empresa?: EmpresaResponse; // 🚀 ¡COMPLEMENTO DE TIPADO FRONTEND!
  detalles?: NominaDetalleResponse[];
}