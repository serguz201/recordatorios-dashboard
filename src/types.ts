export type EstadoRegistro = 'ok' | 'proximo' | 'critico' | 'vencido' | 'sin_fecha';

export interface Registro {
  id: number;
  fechaRegistro: string;
  nombre: string;
  correo: string;
  programa: string;
  fechaInicio: string;
  duracionMeses: number;
  fechaVencimiento: string;
  diasRestantes: number | null;
  aviso7enviado: boolean;
  aviso5enviado: boolean;
  notas: string;
  estado: EstadoRegistro;
}

export interface DashboardData {
  ok: boolean;
  ultimaEjecucion: string;
  horaEnvio: number;
  umbral1: number;
  umbral2: number;
  total: number;
  registros: Registro[];
}
