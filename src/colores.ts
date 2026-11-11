import type { EstadoMaquina, Prioridad } from './api/tipos'

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
