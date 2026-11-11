import type { ColaCircular, Sensor } from '../api/tipos'
import { COLOR_CELDA_VACIA, COLOR_FINAL, COLOR_FRENTE, colorLectura } from '../colores'

interface PropsAnilloLecturas {
  cola: ColaCircular
  /** Sensor cuyos valores colorean las celdas. */
  sensor: Sensor
  indiceSensor: number
  /** Centro de la máquina en el piso. */
  posicion: [number, number, number]
}

/** Distancia del centro de la máquina a las celdas. */
const RADIO = 2
/** Distancia del centro a los marcadores de frente y final, por fuera del anillo. */
const RADIO_MARCADOR = 2.65

/**
 * Posición en el piso de la celda `i` del arreglo de `capacidad` celdas.
 *
 * La celda 0 queda arriba en la pantalla y las siguientes avanzan como las agujas del reloj, igual que en
 * el anillo del HUD. En la vista isométrica, "arriba" en pantalla es la dirección (−1, 0, −1) del mundo y
 * "derecha" es (1, 0, −1).
 */
function posicionCelda(i: number, capacidad: number, radio: number): [number, number] {
  const angulo = (2 * Math.PI * i) / capacidad
  const arriba = Math.cos(angulo) / Math.SQRT2
  const derecha = Math.sin(angulo) / Math.SQRT2
  return [radio * (-arriba + derecha), radio * (-arriba - derecha)]
}

/**
 * La cola circular de lecturas de la máquina seleccionada, dibujada como un anillo de baldosas en el piso
 * alrededor de ella. Cada baldosa es una celda del arreglo en su **posición física**: así se ve que el
 * arreglo no se mueve, sino que avanzan los punteros, y que `final` da la vuelta.
 *
 * Las celdas con lectura toman el color de la zona del valor del sensor elegido; las vacías quedan oscuras.
 * Un marcador blanco señala el `frente` (la lectura más antigua) y un aro cian el `final` (donde se
 * escribirá la siguiente). Con la cola llena, los dos están en la misma celda.
 */
export function AnilloLecturas({ cola, sensor, indiceSensor, posicion }: PropsAnilloLecturas) {
  const [xFrente, zFrente] = posicionCelda(cola.indiceFrente, cola.capacidad, RADIO_MARCADOR)
  const [xFinal, zFinal] = posicionCelda(cola.indiceFinal, cola.capacidad, RADIO_MARCADOR)
  // La lectura más reciente es la anterior a `final`; brilla un poco más.
  const indiceReciente = (cola.indiceFinal - 1 + cola.capacidad) % cola.capacidad

  return (
    <group position={posicion}>
      {cola.celdas.map((lectura, i) => {
        const [x, z] = posicionCelda(i, cola.capacidad, RADIO)
        const color = lectura ? colorLectura(lectura.valores[indiceSensor], sensor) : COLOR_CELDA_VACIA
        const reciente = lectura !== null && i === indiceReciente
        return (
          <mesh key={i} position={[x, 0.06, z]} rotation={[0, Math.atan2(x, z), 0]}>
            <boxGeometry args={[0.7, 0.12, 0.45]} />
            <meshStandardMaterial
              color={color}
              emissive={lectura ? color : '#000000'}
              emissiveIntensity={reciente ? 0.9 : 0.35}
            />
          </mesh>
        )
      })}
      {/* Frente: un cono que apunta a la celda */}
      <mesh position={[xFrente, 0.35, zFrente]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 0.4, 4]} />
        <meshStandardMaterial color={COLOR_FRENTE} emissive={COLOR_FRENTE} emissiveIntensity={0.6} />
      </mesh>
      {/* Final: un aro sobre el piso */}
      <mesh position={[xFinal, 0.08, zFinal]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.26, 24]} />
        <meshBasicMaterial color={COLOR_FINAL} />
      </mesh>
    </group>
  )
}
