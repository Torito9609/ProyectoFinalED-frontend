import type { EstadoMaquina, Prioridad, Sensor, TipoFallo } from './api/tipos'

/**
 * Paleta única del frontend. Ningún componente escribe un color de estado o de prioridad a mano:
 * todos lo toman de aquí.
 */

/** Color de la baliza de una máquina según su estado. */
export const COLOR_ESTADO: Record<EstadoMaquina, string> = {
  OPERANDO: '#3ccf6e',
  EN_ALARMA: '#f5a524',
  DETENIDA: '#e5484d',
  EN_MANTENIMIENTO: '#3b8eea',
  PARADA_MANUAL: '#8b95a5',
  EN_OVERHAUL: '#a371f7',
}

/** Texto corto de cada estado, para las etiquetas. */
export const NOMBRE_ESTADO: Record<EstadoMaquina, string> = {
  OPERANDO: 'Operando',
  EN_ALARMA: 'En alarma',
  DETENIDA: 'Detenida',
  EN_MANTENIMIENTO: 'En mantenimiento',
  PARADA_MANUAL: 'Parada manual',
  EN_OVERHAUL: 'En overhaul',
}

/** Color de cada carril de la cola con prioridad (P1 rojo, P2 naranja, P3 amarillo, P4 azul). */
export const COLOR_PRIORIDAD: Record<Prioridad, string> = {
  P1: '#e5484d',
  P2: '#f76b15',
  P3: '#f5d90a',
  P4: '#3b8eea',
}

/** Color de un valor normal, por debajo del umbral de advertencia. */
const COLOR_NORMAL = '#3ccf6e'

/**
 * Color de un valor leído según la zona de umbrales de su sensor, con los mismos colores de la
 * prioridad que le daría el clasificador: ≥ crítico P1, ≥ alto P2, ≥ advertencia P3; debajo, normal.
 */
export function colorLectura(valor: number, sensor: Sensor): string {
  if (valor >= sensor.umbralCritico) return COLOR_PRIORIDAD.P1
  if (valor >= sensor.umbralAlto) return COLOR_PRIORIDAD.P2
  if (valor >= sensor.umbralAdvertencia) return COLOR_PRIORIDAD.P3
  return COLOR_NORMAL
}

/** Texto de cada tipo de fallo, que es también la especialidad de un técnico. */
export const NOMBRE_TIPO_FALLO: Record<TipoFallo, string> = {
  MECANICO: 'Mecánico',
  ELECTRICO: 'Eléctrico',
}

/** Celda vacía de la cola circular. */
export const COLOR_CELDA_VACIA = '#2c3644'
/** Puntero `frente` de la cola circular: la lectura más antigua, la que se sobrescribe al llenarse. */
export const COLOR_FRENTE = '#ffffff'
/** Puntero `final` de la cola circular: la celda donde se escribirá la próxima lectura. */
export const COLOR_FINAL = '#22d3ee'
