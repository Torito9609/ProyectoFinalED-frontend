import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '../api/cliente'
import type {
  EstadoPlanta,
  EstadoSimulacion,
  Magnitud,
  Modo,
  ResumenCompania,
  ResumenPartida,
  TipoFallo,
} from '../api/tipos'

/** Cada cuánto se pide el estado al backend (ms). */
const INTERVALO_SONDEO_MS = 500
/** Cada cuánto se reintenta pedir la lista de compañías si falló (ms). */
const REINTENTO_LISTA_MS = 2000
/** Cuánto se muestra el aviso de una acción rechazada (ms). */
const DURACION_AVISO_MS = 4000

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
 *
 * Cada ciclo pide también el estado de la simulación (modo y fin de la partida), en paralelo con la
 * compañía. Cuando la partida termina, pide el resumen una vez para mostrarlo.
 *
 * Hay dos mensajes distintos: `error` es del sondeo (el backend no responde) y se borra solo cuando
 * vuelve a responder; `aviso` es de una acción rechazada (por ejemplo un 409) y dura unos segundos,
 * porque si fuera el mismo campo, el siguiente sondeo lo borraría al medio segundo.
 */
export function usePlanta(idCompania: number) {
  const [planta, setPlanta] = useState<EstadoPlanta | null>(null)
  const [simulacion, setSimulacion] = useState<EstadoSimulacion | null>(null)
  /** Resumen de la partida que se está mostrando, o `null` si la ventana está cerrada. */
  const [resumen, setResumen] = useState<ResumenPartida | null>(null)
  const [companias, setCompanias] = useState<ResumenCompania[]>([])
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizadorAviso = useRef<number | undefined>(undefined)

  /** La compañía que se está viendo ahora, para descartar respuestas de la anterior. */
  const idActual = useRef(idCompania)

  /** Pide el estado de la compañía y el de la simulación una vez. */
  const refrescar = useCallback(async () => {
    try {
      const [estado, sim] = await Promise.all([api.obtenerCompania(idCompania), api.obtenerSimulacion()])
      if (estado.idCompania === idActual.current) setPlanta(estado)
      setSimulacion(sim)
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

  // Al terminar la partida se muestra su resumen, una sola vez (reiniciar vuelve a dejar la marca en falso).
  const partidaTerminada = simulacion?.partidaTerminada ?? false
  useEffect(() => {
    if (!partidaTerminada) return
    api
      .obtenerResumenPartida()
      .then(setResumen)
      .catch(() => {
        // Si falla, el usuario lo puede abrir a mano con el botón Resumen.
      })
  }, [partidaTerminada])

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

  /** Muestra el mensaje de una acción rechazada durante unos segundos. */
  const avisar = useCallback((mensaje: string) => {
    window.clearTimeout(temporizadorAviso.current)
    setAviso(mensaje)
    temporizadorAviso.current = window.setTimeout(() => setAviso(null), DURACION_AVISO_MS)
  }, [])

  /**
   * Ejecuta un control de la simulación y luego vuelve a pedir la compañía: los controles devuelven
   * `EstadoSimulacion`, no la planta completa.
   */
  const ejecutar = useCallback(
    async (accion: () => Promise<unknown>) => {
      try {
        await accion()
        await refrescar()
      } catch (e) {
        avisar(mensajeDe(e))
      }
    },
    [refrescar, avisar],
  )

  /**
   * Ejecuta una acción del operador. Estas devuelven el estado completo de la compañía, así que se
   * dibuja de inmediato sin esperar al siguiente sondeo.
   */
  const accionPlanta = useCallback(
    async (accion: () => Promise<EstadoPlanta>) => {
      try {
        const estado = await accion()
        if (estado.idCompania === idActual.current) setPlanta(estado)
      } catch (e) {
        avisar(mensajeDe(e))
      }
    },
    [avisar],
  )

  /** Vuelve a pedir la lista de compañías, por ejemplo después de crear una. */
  const recargarCompanias = useCallback(async () => {
    try {
      setCompanias(await api.listarCompanias())
    } catch (e) {
      avisar(mensajeDe(e))
    }
  }, [avisar])

  /** Abre la ventana del resumen de la partida, aunque no haya terminado. */
  const verResumen = useCallback(async () => {
    try {
      setResumen(await api.obtenerResumenPartida())
    } catch (e) {
      avisar(mensajeDe(e))
    }
  }, [avisar])

  return {
    planta,
    simulacion,
    resumen,
    verResumen,
    cerrarResumen: () => setResumen(null),
    companias,
    recargarCompanias,
    error,
    aviso,
    iniciar: () => ejecutar(api.iniciar),
    pausar: () => ejecutar(api.pausar),
    paso: () => ejecutar(api.paso),
    reiniciar: () => ejecutar(api.reiniciar),
    inyectarFallo: (indice: number, indiceSensor: number, magnitud: Magnitud) =>
      accionPlanta(() => api.inyectarFallo(idCompania, indice, indiceSensor, magnitud)),
    pararOArrancar: (indice: number) => accionPlanta(() => api.pararOArrancar(idCompania, indice)),
    cambiarCarga: (indice: number, carga: number) =>
      accionPlanta(() => api.cambiarCarga(idCompania, indice, carga)),
    deshacer: () => accionPlanta(() => api.deshacer(idCompania)),
    cambiarModo: (modo: Modo) => ejecutar(() => api.cambiarModo(modo)),
    clasificarSiguiente: () => accionPlanta(() => api.clasificarSiguiente(idCompania)),
    asignarSiguiente: (especialidad: TipoFallo) =>
      accionPlanta(() => api.asignarSiguiente(idCompania, especialidad)),
  }
}
