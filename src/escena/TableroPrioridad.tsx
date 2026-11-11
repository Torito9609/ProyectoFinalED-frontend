import type { ColaPrioridad } from '../api/tipos'
import { COLOR_PRIORIDAD } from '../colores'
import { CajaMovil } from './CajaMovil'
import { Etiqueta } from './Etiqueta'

interface PropsTableroPrioridad {
  cola: ColaPrioridad
  /** Posición (x) del carril P1; los demás siguen hacia afuera. */
  x: number
  /** Extremo por donde entran las órdenes, junto al clasificador (z). */
  zEntrada: number
  /** Extremo por donde salen hacia los técnicos (z). */
  zSalida: number
}

/** Separación entre carriles. */
const ANCHO_CARRIL = 1.3
/** Distancia entre dos órdenes del mismo carril. */
const PASO = 1.0

/**
 * La cola con prioridad como un tablero de 4 carriles, uno por prioridad (P1 rojo … P4 azul). Cada carril
 * es una cola FIFO: las órdenes entran junto al clasificador y avanzan hacia la salida, donde las toman
 * los técnicos.
 *
 * El carril `siguiente` (el primero no vacío desde P1, que decide el backend) se resalta: de ahí sale la
 * próxima orden. La cabecera de cada carril dice cuántas órdenes tiene, y solo el frente lleva etiqueta
 * (su id y la especialidad que pide: M mecánico, E eléctrico), para que no se encimen.
 */
export function TableroPrioridad({ cola, x, zEntrada, zSalida }: PropsTableroPrioridad) {
  const largo = zSalida - zEntrada

  return (
    <group>
      {cola.carriles.map((carril, k) => {
        const xCarril = x + k * ANCHO_CARRIL
        const color = COLOR_PRIORIDAD[carril.prioridad]
        const esSiguiente = cola.siguiente === carril.prioridad
        return (
          <group key={carril.prioridad}>
            <mesh position={[xCarril, 0.05, zEntrada + largo / 2]} receiveShadow>
              <boxGeometry args={[0.9, 0.1, largo]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={esSiguiente ? 0.35 : 0.04}
                transparent
                opacity={esSiguiente ? 0.75 : 0.35}
              />
            </mesh>
            <Etiqueta posicion={[xCarril, 0.6, zEntrada - 0.3]}>
              {carril.prioridad} · {carril.ordenes.length}
            </Etiqueta>
            {esSiguiente && (
              <Etiqueta posicion={[xCarril, 0.2, zSalida + 1]} className="etiqueta etiqueta-siguiente">
                siguiente
              </Etiqueta>
            )}
            {carril.ordenes.map((orden, j) => (
              <CajaMovil
                key={orden.id}
                origen={[xCarril, 0.35, zEntrada]}
                destino={[xCarril, 0.35, zSalida - 0.5 - j * PASO]}
              >
                <mesh castShadow>
                  <boxGeometry args={[0.7, 0.4, 0.7]} />
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={j === 0 ? 0.5 : 0.15} />
                </mesh>
                {j === 0 && (
                  <Etiqueta posicion={[0, 0.55, 0]} className="etiqueta etiqueta-caja">
                    OT-{orden.id} {orden.tipoFallo === 'MECANICO' ? 'M' : 'E'}
                  </Etiqueta>
                )}
              </CajaMovil>
            ))}
          </group>
        )
      })}
    </group>
  )
}
