import type { EstadoMaquina } from './api/tipos'

/**
 * Reglas del backend que el frontend repite solo para deshabilitar botones. Quien decide es siempre el
 * backend: si alguna regla cambia allá y no aquí, el botón queda habilitado y el backend responde 409.
 */

/**
 * Una máquina está libre para un overhaul o un reemplazo si está operando o parada a mano (`Maquina.estaLibre`
 * en el backend). En alarma, detenida, en mantenimiento o en overhaul no lo está.
 */
export function estaLibre(estado: EstadoMaquina): boolean {
  return estado === 'OPERANDO' || estado === 'PARADA_MANUAL'
}
