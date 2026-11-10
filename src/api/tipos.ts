/**
 * Tipos de los DTOs que devuelve el backend.
 *
 * Copian `docs/API.md` del repositorio del backend (y los `record` de `edu.unal.planta.api.dto`).
 * Si el contrato cambia, se cambia allá primero y luego aquí.
 */

/** Estados de una máquina. */
export type EstadoMaquina =
  | 'OPERANDO'
  | 'EN_ALARMA'
  | 'DETENIDA'
  | 'EN_MANTENIMIENTO'
  | 'PARADA_MANUAL'

/** Código del tipo de máquina en el catálogo del backend; sirve para elegir su modelo 3D. */
export type TipoMaquina = 'PRENSA' | 'TORNO' | 'ROBOT' | 'COMPRESOR' | 'HORNO' | 'BOMBA'

/** Prioridades de una orden de trabajo: P1 CRÍTICA … P4 BAJA. */
export type Prioridad = 'P1' | 'P2' | 'P3' | 'P4'

/** Magnitud de un fallo inyectado. */
export type Magnitud = 'LEVE' | 'MODERADA' | 'SEVERA'

/** Respuesta de `/api/simulacion`. `semilla` es la maestra, de la que se derivan las de las compañías. */
export interface EstadoSimulacion {
  tick: number
  semilla: number
  enEjecucion: boolean
}

/** Definición de una variable medida, con los umbrales para colorear sus valores. */
export interface Sensor {
  nombre: string
  unidad: string
  nominal: number
  umbralAdvertencia: number
  umbralAlto: number
  umbralCritico: number
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
}

/** Evento ya clasificado. */
export interface OrdenTrabajo {
  id: number
  indiceMaquina: number
  etiquetaMaquina: string
  prioridad: Prioridad
  descripcion: string
  tickCreacion: number
  duracionEstimadaTicks: number
}

/** Técnico interno; los ocupados traen `ordenActual` y `ticksRestantes`. */
export interface Tecnico {
  nombre: string
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
  maquinas: Maquina[]
  /** Cola FIFO: el primero es el siguiente en clasificarse. */
  eventos: EventoFallo[]
  tecnicos: Tecnico[]
  /** Cola FIFO: el primero recibe la siguiente orden. */
  tecnicosLibres: string[]
  colaPrioridad: ColaPrioridad
  /** Pila: el primero es la cima. */
  pilaDeshacer: string[]
  /** De la línea más antigua a la más reciente. */
  bitacora: string[]
}

/** Totales de una compañía: un elemento de `GET /api/companias`. */
export interface ResumenCompania {
  id: number
  nombre: string
  numeroMaquinas: number
  /** Cuántas máquinas hay en cada estado; trae todos los estados, incluso los que tienen 0. */
  maquinasPorEstado: Record<EstadoMaquina, number>
  eventosPendientes: number
  ordenesPendientes: number
  tecnicosLibres: number
}

/** Cuerpo de todas las respuestas de error (400, 404, 409). */
export interface ErrorApi {
  estado: number
  mensaje: string
}
