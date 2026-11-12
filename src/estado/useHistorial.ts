import { useEffect, useState } from 'react'
import * as api from '../api/cliente'
import type { Historial } from '../api/tipos'

/** Cada cuánto se pide el historial (ms): cambia en cada tick. */
const INTERVALO_SONDEO_MS = 1000

/** Ventana de ticks [desde, hasta], los dos incluidos. */
export interface Ventana {
  desde: number
  hasta: number
}

/**
 * Historial de fallos y de costo de una ventana de ticks, global (`idCompania` en `null`) o de una compañía.
 *
 * Con `ventana` en `null` se pide todo lo transcurrido (del tick 0 al último registrado) y la gráfica sigue
 * a la partida en vivo. Con una ventana fija se piden exactamente esos ticks.
 *
 * Cada ciclo pide también la simulación, para saber hasta qué tick se puede mover la ventana: el último
 * registrado es el anterior al tick actual. En el tick 0 todavía no hay nada registrado y no se pide el
 * historial.
 *
 * El total y el pico que llegan los calcula el árbol de segmentos del backend en O(log n); el frontend no
 * suma ni busca el máximo de las series, solo las dibuja.
 */
export function useHistorial(idCompania: number | null, ventana: Ventana | null) {
  const [historial, setHistorial] = useState<Historial | null>(null)
  /** Último tick registrado, o −1 si todavía no hay ninguno. */
  const [ultimoTick, setUltimoTick] = useState(-1)

  useEffect(() => {
    let activo = true
    let temporizador: number | undefined

    async function ciclo() {
      try {
        const simulacion = await api.obtenerSimulacion()
        const ultimo = simulacion.tick - 1
        let datos: Historial | null = null
        if (ultimo >= 0) {
          // La ventana fija se recorta al último tick registrado (por ejemplo, después de reiniciar).
          const desde = ventana ? Math.min(ventana.desde, ultimo) : undefined
          const hasta = ventana ? Math.min(ventana.hasta, ultimo) : undefined
          datos = await api.obtenerHistorial(desde, hasta, idCompania ?? undefined)
        }
        if (activo) {
          setUltimoTick(ultimo)
          setHistorial(datos)
        }
      } catch {
        // El error de conexión ya lo muestra el sondeo de la planta; aquí solo se reintenta.
      }
      if (activo) temporizador = window.setTimeout(ciclo, INTERVALO_SONDEO_MS)
    }

    ciclo()
    return () => {
      activo = false
      window.clearTimeout(temporizador)
    }
  }, [idCompania, ventana])

  return { historial, ultimoTick }
}
