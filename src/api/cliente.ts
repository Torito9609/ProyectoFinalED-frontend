/**
 * Cliente de la API del backend.
 *
 * Es el ÚNICO archivo que conoce URLs y rutas: el resto de la app llama a estas funciones. Así, cuando
 * el backend pase de `/api/planta` a `/api/companias/{id}` (commit 19), solo cambia este archivo.
 */
import type { ErrorApi, EstadoPlanta, EstadoSimulacion } from './tipos'

/** URL base del backend; se puede cambiar con la variable `VITE_API_URL`. */
const URL_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

/**
 * Hace una petición y devuelve el cuerpo como JSON.
 *
 * Si el backend responde con error, lanza un `Error` con el mensaje en español que trae su cuerpo
 * (`{ estado, mensaje }`). Si el backend no responde, el `Error` de `fetch` sube tal cual.
 */
async function pedir<T>(metodo: 'GET' | 'POST' | 'PUT', ruta: string): Promise<T> {
  const respuesta = await fetch(URL_BASE + ruta, { method: metodo })
  if (!respuesta.ok) {
    const error = (await respuesta.json().catch(() => null)) as ErrorApi | null
    throw new Error(error?.mensaje ?? `Error ${respuesta.status} en ${metodo} ${ruta}`)
  }
  return (await respuesta.json()) as T
}

/** Estado completo de la planta: inventario, colas, pila y bitácora. */
export function obtenerPlanta(): Promise<EstadoPlanta> {
  return pedir('GET', '/api/planta')
}

/** Pone a correr el reloj de la simulación. */
export function iniciar(): Promise<EstadoSimulacion> {
  return pedir('POST', '/api/simulacion/iniciar')
}

/** Detiene el reloj. */
export function pausar(): Promise<EstadoSimulacion> {
  return pedir('POST', '/api/simulacion/pausar')
}

/** Pausa y avanza exactamente un tick. */
export function paso(): Promise<EstadoSimulacion> {
  return pedir('POST', '/api/simulacion/paso')
}

/** Pausa y vuelve al tick 0 con la misma semilla. */
export function reiniciar(): Promise<EstadoSimulacion> {
  return pedir('POST', '/api/simulacion/reiniciar')
}
