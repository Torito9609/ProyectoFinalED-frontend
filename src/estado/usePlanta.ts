import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/cliente'
import type { EstadoPlanta } from '../api/tipos'

/** Cada cuánto se pide el estado al backend (ms). */
const INTERVALO_SONDEO_MS = 500

/** Convierte cualquier error en un texto para mostrar. */
function mensajeDe(error: unknown): string {
  // fetch lanza TypeError cuando no hay respuesta (backend apagado, CORS, red).
  if (error instanceof TypeError) return 'No se pudo conectar con el backend'
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Mantiene el último estado de la planta y expone los controles de la simulación.
 *
 * Sondeo con `setTimeout` encadenado: pide el estado y, solo cuando llega la respuesta, programa la
 * siguiente petición. Así nunca hay dos peticiones a la vez aunque el backend tarde. Sondea siempre,
 * también en pausa. Si una petición falla, guarda el mensaje y sigue intentando, de modo que la
 * pantalla se recupera sola cuando el backend vuelve.
 */
export function usePlanta() {
  const [planta, setPlanta] = useState<EstadoPlanta | null>(null)
  const [error, setError] = useState<string | null>(null)

  /** Pide el estado completo una vez. */
  const refrescar = useCallback(async () => {
    try {
      setPlanta(await api.obtenerPlanta())
      setError(null)
    } catch (e) {
      setError(mensajeDe(e))
    }
  }, [])

  useEffect(() => {
    let activo = true
    let temporizador: number | undefined

    async function ciclo() {
      await refrescar()
      if (activo) temporizador = window.setTimeout(ciclo, INTERVALO_SONDEO_MS)
    }

    ciclo()
    return () => {
      activo = false
      window.clearTimeout(temporizador)
    }
  }, [refrescar])

  /**
   * Ejecuta una acción y luego vuelve a pedir la planta: los controles de la simulación devuelven
   * `EstadoSimulacion`, no la planta completa.
   */
  const ejecutar = useCallback(
    async (accion: () => Promise<unknown>) => {
      try {
        await accion()
        await refrescar()
      } catch (e) {
        setError(mensajeDe(e))
      }
    },
    [refrescar],
  )

  return {
    planta,
    error,
    iniciar: () => ejecutar(api.iniciar),
    pausar: () => ejecutar(api.pausar),
    paso: () => ejecutar(api.paso),
    reiniciar: () => ejecutar(api.reiniciar),
  }
}
