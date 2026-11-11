import type { Tecnico, TipoFallo } from '../api/tipos'
import { COLOR_ESPECIALIDAD, NOMBRE_TIPO_FALLO } from '../colores'
import { CajaMovil } from './CajaMovil'
import { Etiqueta } from './Etiqueta'

interface PropsTecnicos {
  tecnicos: Tecnico[]
  /** Las dos colas FIFO de técnicos libres: el primero de cada lista recibe la siguiente orden. */
  tecnicosLibres: Record<TipoFallo, string[]>
  /** Extremo de las bancas donde está el frente de cada cola (x). */
  xFrente: number
  /** Línea de la banca de cada especialidad (z). */
  zBanca: Record<TipoFallo, number>
  /** Centro de la máquina con el índice dado, para poner a su lado al técnico que la repara. */
  posicionMaquina: (indice: number) => [number, number, number]
}

/** Distancia entre dos técnicos sentados en la banca. */
const PASO = 1
/** Largo de cada banca. */
const LARGO_BANCA = 4
const ESPECIALIDADES: TipoFallo[] = ['MECANICO', 'ELECTRICO']

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
 * Las dos colas FIFO de técnicos internos, una por especialidad, como dos bancas.
 *
 * Los libres se sientan en su banca en el orden de la cola: el frente, junto a los carriles P1–P4, es el
 * que recibe la siguiente orden de su especialidad. El que está ocupado camina a la máquina que repara y
 * se queda a su lado con su orden y los ticks que le faltan (×2 si es de la otra especialidad). Al
 * terminar vuelve al final de la banca de su especialidad.
 *
 * Cada técnico se identifica por su nombre, así que es la misma figura la que se mueve.
 */
export function Tecnicos({ tecnicos, tecnicosLibres, xFrente, zBanca, posicionMaquina }: PropsTecnicos) {
  return (
    <group>
      {ESPECIALIDADES.map((especialidad) => (
        <group key={especialidad}>
          <mesh position={[xFrente + LARGO_BANCA / 2 - 0.5, 0.12, zBanca[especialidad] + 0.45]} receiveShadow>
            <boxGeometry args={[LARGO_BANCA, 0.24, 0.35]} />
            <meshStandardMaterial color="#566173" />
          </mesh>
          <Etiqueta posicion={[xFrente + LARGO_BANCA - 0.2, 0.3, zBanca[especialidad] + 0.9]}>
            {NOMBRE_TIPO_FALLO[especialidad]}s libres (FIFO) · {tecnicosLibres[especialidad].length}
          </Etiqueta>
        </group>
      ))}

      {tecnicos.map((tecnico) => {
        const color = COLOR_ESPECIALIDAD[tecnico.especialidad]
        const orden = tecnico.ordenActual
        let destino: [number, number, number]
        if (orden) {
          const [x, , z] = posicionMaquina(orden.indiceMaquina)
          destino = [x + 1.5, 0, z + 1.5]
        } else {
          const puesto = tecnicosLibres[tecnico.especialidad].indexOf(tecnico.nombre)
          destino = [xFrente + puesto * PASO, 0, zBanca[tecnico.especialidad]]
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
