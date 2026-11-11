/**
 * Tipos de los DTOs que devuelve el backend.
 *
 * Copian `docs/API.md` del repositorio del backend (y los `record` de `edu.unal.planta.api.dto`).
 * Si el contrato cambia, se cambia allá primero y luego aquí.
 */

// ---------------------------------------------------------------------------------------------
// Enumerados: viajan como texto, con su nombre
// ---------------------------------------------------------------------------------------------

/** Estados de una máquina. `EN_OVERHAUL`: un técnico del fabricante le hace un overhaul; no produce. */
export type EstadoMaquina =
  | 'OPERANDO'
  | 'EN_ALARMA'
  | 'DETENIDA'
  | 'EN_MANTENIMIENTO'
  | 'PARADA_MANUAL'
  | 'EN_OVERHAUL'

/** Código del tipo de máquina en el catálogo del backend; sirve para elegir su modelo 3D. */
export type TipoMaquina = 'PRENSA' | 'TORNO' | 'ROBOT' | 'COMPRESOR' | 'HORNO' | 'BOMBA'

/** Prioridades de una orden de trabajo: P1 CRÍTICA … P4 BAJA. */
export type Prioridad = 'P1' | 'P2' | 'P3' | 'P4'

/** Magnitud de un fallo inyectado. */
export type Magnitud = 'LEVE' | 'MODERADA' | 'SEVERA'

/** Tipo de fallo de un sensor; es también la especialidad de un técnico. */
export type TipoFallo = 'MECANICO' | 'ELECTRICO'

/** Modo de la simulación: en `MANUAL` el jugador clasifica, asigna y despacha los overhauls. */
export type Modo = 'AUTOMATICO' | 'MANUAL'

/** Recomendación del ranking según el puntaje de fallos y los overhauls recibidos. */
export type Recomendacion = 'NINGUNA' | 'OVERHAUL' | 'REEMPLAZO'

// ---------------------------------------------------------------------------------------------
// Simulación y partida
// ---------------------------------------------------------------------------------------------

/** Respuesta de `/api/simulacion`. `semilla` es la maestra, de la que se derivan las de las compañías. */
export interface EstadoSimulacion {
  tick: number
  semilla: number
  enEjecucion: boolean
  modo: Modo
  duracionPartida: number
  /** Al terminar, el reloj se pausa y solo `reiniciar` empieza otra partida. */
  partidaTerminada: boolean
}

/** Respuesta de `GET /api/partida/resumen`; con `terminada` en `true` es el resultado final. */
export interface ResumenPartida {
  tick: number
  duracionPartida: number
  terminada: boolean
  modo: Modo
  companias: ResumenCompania[]
}

// ---------------------------------------------------------------------------------------------
// Planta de una compañía
// ---------------------------------------------------------------------------------------------

/** Definición de una variable medida, con los umbrales para colorear sus valores. */
export interface Sensor {
  nombre: string
  unidad: string
  nominal: number
  umbralAdvertencia: number
  umbralAlto: number
  umbralCritico: number
  /** La especialidad que repara los fallos de este sensor. */
  tipoFallo: TipoFallo
}

/** Una lectura: `valores[k]` corresponde a `sensores[k]` de su máquina. */
export interface Lectura {
  tick: number
  valores: number[]
}

/**
 * Cola circular de lecturas de una máquina.
 *
 * `celdas` va en **orden físico** (índice 0 a capacidad − 1), no en orden de llegada; una celda vacía es
 * `null`. `indiceFrente` es la lectura más antigua e `indiceFinal` donde se escribirá la próxima.
 */
export interface ColaCircular {
  capacidad: number
  tamano: number
  indiceFrente: number
  indiceFinal: number
  sobrescrituras: number
  celdas: (Lectura | null)[]
}

/** Una máquina del inventario (`ArrayList`), identificada por su índice. */
export interface Maquina {
  indice: number
  etiqueta: string
  /** Código del catálogo, por ejemplo `PRENSA`. */
  tipo: TipoMaquina
  /** Texto para mostrar, por ejemplo `Prensa hidráulica`. */
  tipoDescripcion: string
  estado: EstadoMaquina
  carga: number
  ticksDesdeMantenimiento: number
  intervaloPreventivo: number
  tieneAnomalia: boolean
  alarmaActiva: boolean
  /** Clave del ranking: P1 suma 3, P2 suma 2, P3 suma 1, desde el último overhaul. */
  puntajeFallos: number
  numeroOverhauls: number
  recomendacion: Recomendacion
  /** Ya tiene una solicitud esperando en el montículo: no se puede aprobar otra. */
  overhaulPendiente: boolean
  sensores: Sensor[]
  lecturas: ColaCircular
}

/** Detección cruda, sin prioridad, que espera en la cola de eventos. */
export interface EventoFallo {
  indiceMaquina: number
  etiquetaMaquina: string
  indiceSensor: number
  nombreSensor: string
  valorLeido: number
  tick: number
  tipoFallo: TipoFallo
}

/** Evento ya clasificado. `tipoFallo` es la especialidad que pide. */
export interface OrdenTrabajo {
  id: number
  indiceMaquina: number
  etiquetaMaquina: string
  prioridad: Prioridad
  descripcion: string
  tickCreacion: number
  duracionEstimadaTicks: number
  tipoFallo: TipoFallo
}

/** Técnico interno; los ocupados traen `ordenActual` y `ticksRestantes` (ya con la penalidad). */
export interface Tecnico {
  nombre: string
  especialidad: TipoFallo
  libre: boolean
  ordenActual: OrdenTrabajo | null
  ticksRestantes: number
}

/** Un carril FIFO de la cola con prioridad: el primero de `ordenes` sale primero. */
export interface Carril {
  prioridad: Prioridad
  descripcion: string
  ordenes: OrdenTrabajo[]
}

/** Cola con prioridad: siempre 4 carriles, de P1 a P4. */
export interface ColaPrioridad {
  carriles: Carril[]
  /** Carril del que sale la próxima orden, o `null` si no hay órdenes. */
  siguiente: Prioridad | null
  tamano: number
}

/** Respuesta de `GET /api/companias/{id}`: una foto consistente de la planta de una compañía. */
export interface EstadoPlanta {
  /** Id de la compañía: su índice en la organización. */
  idCompania: number
  nombre: string
  tick: number
  /** Semilla de esta compañía, derivada de la maestra. */
  semilla: number
  enEjecucion: boolean
  modo: Modo
  caja: number
  ingresos: number
  costos: number
  /** Si la caja bajó de 0: la compañía no opera y sus acciones responden 409. */
  enQuiebra: boolean
  maquinas: Maquina[]
  /** Cola FIFO: el primero es el siguiente en clasificarse. */
  eventos: EventoFallo[]
  tecnicos: Tecnico[]
  /** Dos colas FIFO, una por especialidad: en cada una, el primero recibe la siguiente orden. */
  tecnicosLibres: Record<TipoFallo, string[]>
  colaPrioridad: ColaPrioridad
  /** Pila: el primero es la cima. */
  pilaDeshacer: string[]
  /** De la línea más antigua a la más reciente. */
  bitacora: string[]
}

/** Totales de una compañía: un elemento de `GET /api/companias` y de `ResumenPartida`. */
export interface ResumenCompania {
  id: number
  nombre: string
  numeroMaquinas: number
  /** Cuántas máquinas hay en cada estado; trae todos los estados, incluso los que tienen 0. */
  maquinasPorEstado: Record<EstadoMaquina, number>
  eventosPendientes: number
  ordenesPendientes: number
  tecnicosLibres: number
  caja: number
  ingresos: number
  costos: number
  /** Órdenes P1 a P3. */
  numeroFallos: number
  /** Fracción del tiempo en que las máquinas produjeron, de 0 a 1. */
  disponibilidad: number
  enQuiebra: boolean
}

/** Un tipo del catálogo, para el formulario de crear máquina. */
export interface TipoMaquinaCatalogo {
  tipo: TipoMaquina
  descripcion: string
  /** Sirve para sugerir la etiqueta siguiente, por ejemplo `TORNO-02`. */
  prefijo: string
}

// ---------------------------------------------------------------------------------------------
// Superusuario: ranking, overhauls e historial
// ---------------------------------------------------------------------------------------------

/** Una máquina en el ranking, identificada por `(idCompania, indice)`. */
export interface EntradaRanking {
  posicion: number
  idCompania: number
  nombreCompania: string
  indice: number
  etiqueta: string
  tipo: TipoMaquina
  estado: EstadoMaquina
  puntajeFallos: number
  numeroOverhauls: number
  recomendacion: Recomendacion
}

/** Respuesta de `GET /api/ranking`: un árbol rojo-negro recorrido en orden. */
export interface Ranking {
  /** `"Global"` o el nombre de la compañía. */
  alcance: string
  umbralOverhaul: number
  maximoOverhauls: number
  maquinas: EntradaRanking[]
}

/** Una solicitud de overhaul; la clave del montículo es `puntajeCongelado`, y `secuencia` desempata. */
export interface SolicitudOverhaul {
  idCompania: number
  nombreCompania: string
  indiceMaquina: number
  etiqueta: string
  puntajeCongelado: number
  secuencia: number
  tickAprobacion: number
}

/** Técnico del fabricante, compartido por todas las compañías. */
export interface TecnicoExterno {
  nombre: string
  libre: boolean
  solicitudActual: SolicitudOverhaul | null
  ticksRestantes: number
}

/**
 * Respuesta de `/api/overhauls`. El montículo no se manda como árbol (`PriorityQueue` no expone su
 * arreglo): llegan la cima y el orden de salida.
 */
export interface EstadoOverhauls {
  modo: Modo
  /** La solicitud que sale primero, o `null` si no hay. */
  cima: SolicitudOverhaul | null
  /** De la primera a la última en salir; la primera es la cima. */
  ordenDeSalida: SolicitudOverhaul[]
  tecnicos: TecnicoExterno[]
  /** Cola FIFO: el primero recibe el próximo overhaul. */
  tecnicosLibres: string[]
  duracionOverhaul: number
  costoOverhaul: number
  costoReemplazo: number
}

/**
 * Respuesta de `GET /api/historial`. El total y el pico los calcula el árbol de segmentos del backend;
 * las series son para dibujar la gráfica: `fallosPorTick[i]` es el del tick `desde + i`.
 */
export interface Historial {
  alcance: string
  desde: number
  hasta: number
  totalFallos: number
  picoFallos: number
  totalCosto: number
  picoCosto: number
  fallosPorTick: number[]
  costoPorTick: number[]
}

/** Cuerpo de todas las respuestas de error (400, 404, 409). */
export interface ErrorApi {
  estado: number
  mensaje: string
}
