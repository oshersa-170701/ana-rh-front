export interface EmpleadoIdentificado {
  id: string;          // 👈 Indispensable para relacionar la asistencia
  tenant_id: string;   // 👈 Indispensable para saber a qué empresa pertenece
  nombre: string;
  puesto: string;
  curp: string;
}