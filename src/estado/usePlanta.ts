import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '../api/cliente'
import type { EstadoPlanta, ResumenCompania } from '../api/tipos'

/** Cada cuánto se pide el estado al backend (ms). */
const INTERVALO_SONDEO_MS = 500
/** Cada cuánto se reintenta pedir la lista de compañías si falló (ms). */
const REINTENTO_LISTA_MS = 2000

/** Convierte cualquier error en un texto para mostrar. */
function mensajeDe(error: unknown): string {
  // fetch lanza TypeError cuando no hay respuesta (backend apagado, CORS, red).
  if (error instanceof TypeError) return 'No se pudo conectar con el backend'
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Mantiene el último estado de la compañía `idCompania`, la lista de compañías y los controles de la
 * simulación.
 *
 * Sondeo con `setTimeout` encadenado: pide el estado y, solo cuando llega la respuesta, programa la
 * siguiente petición. Así nunca hay dos peticiones a la vez aunque el backend tarde. Sondea siempre,
 * también en pausa. Si una petición falla, guarda el mensaje y sigue intentando, de modo que la
 * pantalla se recupera sola cuando el backend vuelve.
 *
 * Al cambiar de compañía, el sondeo se reinicia con la nueva. Una respuesta que llega tarde de la
 * compañía anterior se descarta, para que no pise a la nueva.
 *
 * La lista de compañías se pide una sola vez al arrancar (reintentando si el backend no está): las
 * compañías no cambian solas.
 */
export function usePlanta(idCompania: number) {
  const [planta, setPlanta] = useState<EstadoPlanta | null>(null)
  const [companias, setCompanias] = useState<ResumenCompania[]>([])
  const [error, setError] = useState<string | null>(null)

  /** La compañía que se está viendo ahora, para descartar respuestas de la anterior. */
  const idActual = useRef(idCompania)

  /** Pide el estado de la compañía una vez. */
  const refrescar = useCallback(async () => {
    try {
      const estado = await api.obtenerCompania(idCompania)
      if (estado.idCompania === idActual.current) setPlanta(estado)
      setError(null)
    } catch (e) {
      setError(mensajeDe(e))
    }
  }, [idCompania])

  // Sondeo de la compañía seleccionada.
  useEffect(() => {
    idActual.current = idCompania
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
  }, [idCompania, refrescar])

  // Lista de compañías, una vez al arrancar.
  useEffect(() => {
    let activo = true
    let temporizador: number | undefined

    async function pedirLista() {
      try {
        const lista = await api.listarCompanias()
        if (activo) setCompanias(lista)
      } catch {
        // El error ya lo muestra el sondeo; aquí solo se reintenta.
        if (activo) temporizador = window.setTimeout(pedirLista, REINTENTO_LISTA_MS)
      }
    }

    pedirLista()
    return () => {
      activo = false
      window.clearTimeout(temporizador)
    }
  }, [])

  /**
   * Ejecuta una acción y luego vuelve a pedir la compañía: los controles de la simulación devuelven
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
    companias,
    error,
    iniciar: () => ejecutar(api.iniciar),
    pausar: () => ejecutar(api.pausar),
    paso: () => ejecutar(api.paso),
    reiniciar: () => ejecutar(api.reiniciar),
  }
}
