/**
 * Cliente de la API del backend.
 *
 * Es el ÚNICO archivo que conoce URLs y rutas: el resto de la app llama a estas funciones. Así, si
 * una ruta del backend cambia, solo cambia este archivo.
 */
import type {
  ErrorApi,
  EstadoOverhauls,
  EstadoPlanta,
  EstadoSimulacion,
  Historial,
  Magnitud,
  Modo,
  Ranking,
  ResumenCompania,
  ResumenPartida,
  TipoFallo,
  TipoMaquina,
  TipoMaquinaCatalogo,
} from './tipos'

/** URL base del backend; se puede cambiar con la variable `VITE_API_URL`. */
const URL_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

/**
 * Hace una petición y devuelve el cuerpo como JSON. Si se da `cuerpo`, se envía como JSON.
 *
 * Si el backend responde con error, lanza un `Error` con el mensaje en español que trae su cuerpo
 * (`{ estado, mensaje }`). Si el backend no responde, el `Error` de `fetch` sube tal cual.
 */
async function pedir<T>(metodo: 'GET' | 'POST' | 'PUT', ruta: string, cuerpo?: unknown): Promise<T> {
  const respuesta = await fetch(URL_BASE + ruta, {
    method: metodo,
    headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  })
  if (!respuesta.ok) {
    const error = (await respuesta.json().catch(() => null)) as ErrorApi | null
    throw new Error(error?.mensaje ?? `Error ${respuesta.status} en ${metodo} ${ruta}`)
  }
  return (await respuesta.json()) as T
}

/** Arma la parte `?a=1&b=2` de una ruta, omitiendo los parámetros que no vienen. */
function consulta(parametros: Record<string, number | undefined>): string {
  const presentes = Object.entries(parametros).filter(([, valor]) => valor !== undefined)
  if (presentes.length === 0) return ''
  return '?' + presentes.map(([nombre, valor]) => `${nombre}=${valor}`).join('&')
}

// ---------------------------------------------------------------------------------------------
// Simulación y partida. El reloj es uno solo para toda la organización: no llevan compañía.
// ---------------------------------------------------------------------------------------------

/** Tick, semilla maestra, modo y si la partida terminó. */
export function obtenerSimulacion(): Promise<EstadoSimulacion> {
  return pedir('GET', '/api/simulacion')
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

/** Pausa y vuelve al tick 0 con la misma semilla; conserva lo creado y el modo. */
export function reiniciar(): Promise<EstadoSimulacion> {
  return pedir('POST', '/api/simulacion/reiniciar')
}

/** Cambia entre automático y manual, sin pausar. */
export function cambiarModo(modo: Modo): Promise<EstadoSimulacion> {
  return pedir('PUT', '/api/simulacion/modo', { modo })
}

/** Resultado de la partida, compañía por compañía. */
export function obtenerResumenPartida(): Promise<ResumenPartida> {
  return pedir('GET', '/api/partida/resumen')
}

// ---------------------------------------------------------------------------------------------
// Compañías y creación
// ---------------------------------------------------------------------------------------------

/** Las compañías con sus totales, en el orden de sus ids. */
export function listarCompanias(): Promise<ResumenCompania[]> {
  return pedir('GET', '/api/companias')
}

/** Estado completo de una compañía: inventario, colas, pila y bitácora. */
export function obtenerCompania(idCompania: number): Promise<EstadoPlanta> {
  return pedir('GET', `/api/companias/${idCompania}`)
}

/** Crea una compañía al final de la lista; el nombre debe ser único. */
export function crearCompania(nombre: string): Promise<ResumenCompania> {
  return pedir('POST', '/api/companias', { nombre })
}

/** Crea una máquina al final del inventario de una compañía; la etiqueta debe ser única en ella. */
export function crearMaquina(idCompania: number, tipo: TipoMaquina, etiqueta: string): Promise<EstadoPlanta> {
  return pedir('POST', `/api/companias/${idCompania}/maquinas`, { tipo, etiqueta })
}

/** El catálogo de tipos de máquina, para el formulario. */
export function listarTiposMaquina(): Promise<TipoMaquinaCatalogo[]> {
  return pedir('GET', '/api/tipos-maquina')
}

// ---------------------------------------------------------------------------------------------
// Acciones del operador sobre una compañía. Todas devuelven su estado completo.
// ---------------------------------------------------------------------------------------------

/** Provoca una anomalía; se rechaza si la máquina ya tiene un fallo activo. */
export function inyectarFallo(
  idCompania: number,
  indiceMaquina: number,
  indiceSensor: number,
  magnitud: Magnitud,
): Promise<EstadoPlanta> {
  return pedir('POST', `/api/companias/${idCompania}/maquinas/${indiceMaquina}/inyectar-fallo`, {
    indiceSensor,
    magnitud,
  })
}

/** Alterna entre operando y parada manual. Se puede deshacer. */
export function pararOArrancar(idCompania: number, indiceMaquina: number): Promise<EstadoPlanta> {
  return pedir('POST', `/api/companias/${idCompania}/maquinas/${indiceMaquina}/parar-o-arrancar`)
}

/** Cambia la carga (0 a 100). Se puede deshacer. */
export function cambiarCarga(idCompania: number, indiceMaquina: number, carga: number): Promise<EstadoPlanta> {
  return pedir('PUT', `/api/companias/${idCompania}/maquinas/${indiceMaquina}/carga`, { carga })
}

/** Revierte la cima de la pila de deshacer. */
export function deshacer(idCompania: number): Promise<EstadoPlanta> {
  return pedir('POST', `/api/companias/${idCompania}/deshacer`)
}

/** Modo manual: clasifica el evento del frente de la cola FIFO. */
export function clasificarSiguiente(idCompania: number): Promise<EstadoPlanta> {
  return pedir('POST', `/api/companias/${idCompania}/clasificar-siguiente`)
}

/** Modo manual: asigna la orden más prioritaria al primer técnico libre de la especialidad elegida. */
export function asignarSiguiente(idCompania: number, especialidad: TipoFallo): Promise<EstadoPlanta> {
  return pedir('POST', `/api/companias/${idCompania}/asignar-siguiente`, { especialidad })
}

/** Reemplaza una máquina con recomendación de reemplazo por una nueva en el mismo índice. */
export function reemplazarMaquina(idCompania: number, indiceMaquina: number): Promise<EstadoPlanta> {
  return pedir('POST', `/api/companias/${idCompania}/maquinas/${indiceMaquina}/reemplazo`)
}

// ---------------------------------------------------------------------------------------------
// Superusuario: ranking, overhauls e historial
// ---------------------------------------------------------------------------------------------

/** Ranking de fallos: global si no se da compañía; con `puntajeMinimo`, solo las que lo alcanzan. */
export function obtenerRanking(idCompania?: number, puntajeMinimo?: number): Promise<Ranking> {
  return pedir('GET', '/api/ranking' + consulta({ compania: idCompania, puntajeMinimo }))
}

/** El montículo de solicitudes (cima y orden de salida) y los técnicos del fabricante. */
export function obtenerOverhauls(): Promise<EstadoOverhauls> {
  return pedir('GET', '/api/overhauls')
}

/** Aprueba un overhaul para una máquina con recomendación. */
export function aprobarOverhaul(idCompania: number, indiceMaquina: number): Promise<EstadoOverhauls> {
  return pedir('POST', '/api/overhauls', { idCompania, indiceMaquina })
}

/** Modo manual: despacha el camión del fabricante para la solicitud de la cima. */
export function asignarSiguienteOverhaul(): Promise<EstadoOverhauls> {
  return pedir('POST', '/api/overhauls/asignar-siguiente')
}

/** Total, pico y serie por tick de fallos y de costo en una ventana; global si no se da compañía. */
export function obtenerHistorial(desde?: number, hasta?: number, idCompania?: number): Promise<Historial> {
  return pedir('GET', '/api/historial' + consulta({ desde, hasta, compania: idCompania }))
}
