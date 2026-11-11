import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import type { ColaPrioridad, EventoFallo, Maquina, Tecnico, TipoFallo } from '../api/tipos'
import { AnilloLecturas } from './AnilloLecturas'
import { BandaEventos } from './BandaEventos'
import { CapaEtiquetas } from './capaEtiquetas'
import { MaquinaModelo } from './MaquinaModelo'
import { PilaDeshacer } from './PilaDeshacer'
import { TableroPrioridad } from './TableroPrioridad'
import { Tecnicos } from './Tecnicos'
import './escena.css'

/** Máquinas por fila en el piso. */
const COLUMNAS = 3
/** Distancia entre los centros de dos máquinas vecinas. */
const SEPARACION = 4
/**
 * Cuánto se acerca el diorama a la cámara, en x y en z. En la vista isométrica, acercarlo lo baja en
 * pantalla: así deja espacio a la barra superior del HUD.
 */
const DESPLAZAMIENTO = 2
/** Espacio de la zona de control: la banda de eventos atrás y el tablero P1–P4 a la derecha. */
const ANCHO_TABLERO = 5

/**
 * Posición en el piso de la máquina `indice`: se reparten por filas en orden de índice,
 * como están en el `ArrayList` del inventario, y la cuadrícula queda centrada en el origen.
 */
function posicionDe(indice: number, total: number): [number, number, number] {
  const filas = Math.ceil(total / COLUMNAS)
  const columna = indice % COLUMNAS
  const fila = Math.floor(indice / COLUMNAS)
  return [(columna - (COLUMNAS - 1) / 2) * SEPARACION, 0, (fila - (filas - 1) / 2) * SEPARACION]
}

interface PropsEscena {
  maquinas: Maquina[]
  eventos: EventoFallo[]
  colaPrioridad: ColaPrioridad | null
  tecnicos: Tecnico[]
  tecnicosLibres: Record<TipoFallo, string[]>
  /** Pila de deshacer; la primera es la cima. */
  pilaDeshacer: string[]
  /** Índice de la máquina seleccionada, o `null`. */
  seleccionada: number | null
  seleccionar: (indice: number | null) => void
  /** Sensor cuyos valores colorean la cola circular de la máquina seleccionada. */
  sensorVista: number
}

/**
 * El mundo 3D: cámara isométrica fija, luces, piso, las máquinas y las colas de la planta.
 *
 * La cámara es ortográfica (sin perspectiva) y mira al origen desde la diagonal (1, 1, 1): esa es la
 * vista isométrica. No hay controles de cámara: el diorama siempre se ve igual.
 *
 * Distribución: las máquinas en una cuadrícula; detrás, la banda de eventos, que termina en el
 * clasificador; a la derecha, el tablero P1–P4, que empieza junto al clasificador y termina en las bancas
 * de los técnicos; a la izquierda, el escritorio con la pila de deshacer. Todo se calcula a partir
 * del tamaño de la cuadrícula, así sigue en su lugar si se crean máquinas.
 *
 * Un clic en una máquina la selecciona y muestra su cola circular en el piso; un clic en el vacío quita
 * la selección.
 */
export function Escena(props: PropsEscena) {
  const { maquinas, eventos, colaPrioridad, seleccionada, seleccionar, sensorVista } = props
  const { tecnicos, tecnicosLibres, pilaDeshacer } = props
  const filas = Math.max(1, Math.ceil(maquinas.length / COLUMNAS))
  const maquinaSeleccionada = seleccionada === null ? undefined : maquinas[seleccionada]
  /** Contenedor fijo para las etiquetas HTML (ver `CapaEtiquetas`). */
  const capaEtiquetas = useRef<HTMLDivElement>(null)

  // Bordes de la cuadrícula de máquinas.
  const mitadX = (COLUMNAS * SEPARACION) / 2
  const mitadZ = (filas * SEPARACION) / 2
  // Banda de eventos detrás de las máquinas; tablero a la derecha.
  const zBanda = -mitadZ - 2
  const xTablero = mitadX + 1.4
  // Bancas de los técnicos a la salida del tablero; escritorio a la izquierda.
  // Cada banca es una fila horizontal en pantalla; la de eléctricos queda debajo de la de mecánicos.
  const frenteBanca: Record<TipoFallo, [number, number]> = {
    MECANICO: [xTablero + 0.8, mitadZ + 4.4],
    ELECTRICO: [xTablero + 3.2, mitadZ + 6.9],
  }
  const posicionEscritorio: [number, number, number] = [-mitadX - 2, 0, 0]
  // Piso que cubre todo, y desplazamiento que lo centra en pantalla.
  const piso = { xMin: -mitadX - 3.2, xMax: xTablero + ANCHO_TABLERO, zMin: zBanda - 1.2, zMax: mitadZ + 8.2 }
  const centroX = (piso.xMin + piso.xMax) / 2
  const centroZ = (piso.zMin + piso.zMax) / 2

  return (
    <div ref={capaEtiquetas} className="escena">
      <CapaEtiquetas.Provider value={capaEtiquetas}>
        <Canvas
          shadows
          orthographic
          camera={{ position: [20, 20, 20], zoom: 40 }}
          onPointerMissed={() => seleccionar(null)}
        >
          <color attach="background" args={['#1e2530']} />
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[8, 14, 5]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-18}
            shadow-camera-right={18}
            shadow-camera-top={18}
            shadow-camera-bottom={-18}
          />
          <group position={[-centroX + DESPLAZAMIENTO, 0, -centroZ + DESPLAZAMIENTO]}>
            {/* Piso */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centroX, 0, centroZ]} receiveShadow>
              <planeGeometry args={[piso.xMax - piso.xMin, piso.zMax - piso.zMin]} />
              <meshStandardMaterial color="#2a3240" />
            </mesh>
            {maquinas.map((maquina) => (
              <MaquinaModelo
                key={maquina.indice}
                maquina={maquina}
                posicion={posicionDe(maquina.indice, maquinas.length)}
                alSeleccionar={() => seleccionar(maquina.indice)}
              />
            ))}
            {maquinaSeleccionada && (
              <AnilloLecturas
                cola={maquinaSeleccionada.lecturas}
                sensor={maquinaSeleccionada.sensores[sensorVista]}
                indiceSensor={sensorVista}
                posicion={posicionDe(maquinaSeleccionada.indice, maquinas.length)}
              />
            )}
            <BandaEventos eventos={eventos} xEntrada={-mitadX} xSalida={mitadX - 0.4} z={zBanda} />
            {colaPrioridad && (
              <TableroPrioridad cola={colaPrioridad} x={xTablero} zEntrada={zBanda + 0.7} zSalida={mitadZ} />
            )}
            <Tecnicos
              tecnicos={tecnicos}
              tecnicosLibres={tecnicosLibres}
              frenteBanca={frenteBanca}
              posicionMaquina={(indice) => posicionDe(indice, maquinas.length)}
            />
            <PilaDeshacer acciones={pilaDeshacer} posicion={posicionEscritorio} />
          </group>
        </Canvas>
      </CapaEtiquetas.Provider>
    </div>
  )
}
