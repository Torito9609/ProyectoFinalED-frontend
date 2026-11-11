import type { Tecnico, TipoFallo } from '../api/tipos'
import { COLOR_ESPECIALIDAD, NOMBRE_TIPO_FALLO } from '../colores'
import { CajaMovil } from './CajaMovil'
import { Etiqueta } from './Etiqueta'

interface PropsTecnicos {
  tecnicos: Tecnico[]
  /** Las dos colas FIFO de técnicos libres: el primero de cada lista recibe la siguiente orden. */
  tecnicosLibres: Record<TipoFallo, string[]>
  /** Puesto del frente de la banca de cada especialidad, en el piso (x, z). */
  frenteBanca: Record<TipoFallo, [number, number]>
  /** Centro de la máquina con el índice dado, para poner a su lado al técnico que la repara. */
  posicionMaquina: (indice: number) => [number, number, number]
}

/** Distancia entre dos puestos de la banca. */
const PASO = 1.2
/** Puestos que se dibujan en cada banca. */
const PUESTOS = 3
/**
 * Dirección de la fila: (1, 0, −1) normalizada. En la vista isométrica es la horizontal de la pantalla,
 * así cada cola se lee de izquierda a derecha, con el frente a la izquierda.
 */
const FILA: [number, number] = [Math.SQRT1_2, -Math.SQRT1_2]
const ESPECIALIDADES: TipoFallo[] = ['MECANICO', 'ELECTRICO']

/** Punto del piso del puesto `i` de una banca que empieza en `frente`. */
function puesto(frente: [number, number], i: number): [number, number, number] {
  return [frente[0] + i * PASO * FILA[0], 0, frente[1] + i * PASO * FILA[1]]
}

/** Una figura sencilla: cuerpo y cabeza. */
function Figura({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.7, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial color="#f1d3b3" />
      </mesh>
    </group>
  )
}

/**
 * Las dos colas FIFO de técnicos internos, una por especialidad, como dos bancas en fila.
 *
 * Los libres esperan en su banca en el orden de la cola: el de la izquierda (el frente) es el que recibe
 * la siguiente orden de su especialidad. El que está ocupado camina a la máquina que repara y se queda a
 * su lado con su orden y los ticks que le faltan (×2 si es de la otra especialidad). Al terminar vuelve al
 * final de la fila de su especialidad.
 *
 * Cada técnico se identifica por su nombre, así que es la misma figura la que se mueve.
 */
export function Tecnicos({ tecnicos, tecnicosLibres, frenteBanca, posicionMaquina }: PropsTecnicos) {
  return (
    <group>
      {ESPECIALIDADES.map((especialidad) => {
        const frente = frenteBanca[especialidad]
        const [xMedio, , zMedio] = puesto(frente, (PUESTOS - 1) / 2)
        const [xFin, , zFin] = puesto(frente, PUESTOS + 0.6)
        return (
          <group key={especialidad}>
            {/* Banca: una tabla a lo largo de la fila, detrás de los puestos */}
            <mesh position={[xMedio - 0.35, 0.12, zMedio - 0.35]} rotation={[0, Math.PI / 4, 0]} receiveShadow>
              <boxGeometry args={[PUESTOS * PASO, 0.24, 0.3]} />
              <meshStandardMaterial color="#566173" />
            </mesh>
            <Etiqueta posicion={puesto(frente, -0.9)} className="etiqueta etiqueta-frente">
              frente
            </Etiqueta>
            <Etiqueta posicion={[xFin, 0.2, zFin]}>
              {NOMBRE_TIPO_FALLO[especialidad]}s libres (FIFO) · {tecnicosLibres[especialidad].length}
            </Etiqueta>
          </group>
        )
      })}

      {tecnicos.map((tecnico) => {
        const color = COLOR_ESPECIALIDAD[tecnico.especialidad]
        const orden = tecnico.ordenActual
        let destino: [number, number, number]
        if (orden) {
          const [x, , z] = posicionMaquina(orden.indiceMaquina)
          destino = [x + 1.5, 0, z + 1.5]
        } else {
          const lugar = tecnicosLibres[tecnico.especialidad].indexOf(tecnico.nombre)
          destino = puesto(frenteBanca[tecnico.especialidad], lugar)
        }
        const penalidad = orden !== null && orden.tipoFallo !== tecnico.especialidad
        return (
          <CajaMovil key={tecnico.nombre} origen={destino} destino={destino}>
            <Figura color={color} />
            <Etiqueta posicion={[0, 1.55, 0]} className="etiqueta etiqueta-caja">
              {orden
                ? `${tecnico.nombre} · OT-${orden.id} · ${tecnico.ticksRestantes}${penalidad ? ' ×2' : ''}`
                : tecnico.nombre}
            </Etiqueta>
          </CajaMovil>
        )
      })}
    </group>
  )
}
