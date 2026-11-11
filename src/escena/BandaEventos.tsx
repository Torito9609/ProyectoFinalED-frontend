import type { EventoFallo } from '../api/tipos'
import { COLOR_ESTADO } from '../colores'
import { CajaMovil } from './CajaMovil'
import { Etiqueta } from './Etiqueta'

interface PropsBandaEventos {
  eventos: EventoFallo[]
  /** Extremo por donde entran los eventos (x). */
  xEntrada: number
  /** Extremo por donde salen hacia el clasificador (x). */
  xSalida: number
  /** Línea de la banda (z). */
  z: number
}

/** Distancia entre dos eventos en la banda. */
const PASO = 1.1

/**
 * La cola FIFO de eventos como una banda transportadora. Los eventos entran por un extremo y salen por el
 * otro hacia el clasificador, en el mismo orden: el primero de la lista (el frente) es el que está junto a
 * la salida.
 *
 * Los eventos todavía no tienen prioridad (son detecciones crudas), así que todos llevan el color de
 * alarma; la prioridad aparece cuando el clasificador los convierte en órdenes.
 */
export function BandaEventos({ eventos, xEntrada, xSalida, z }: PropsBandaEventos) {
  const largo = xSalida - xEntrada
  const color = COLOR_ESTADO.EN_ALARMA

  return (
    <group>
      {/* Banda */}
      <mesh position={[xEntrada + largo / 2, 0.1, z]} receiveShadow>
        <boxGeometry args={[largo, 0.2, 1]} />
        <meshStandardMaterial color="#151a21" />
      </mesh>
      {/* Bordes */}
      {[-0.55, 0.55].map((dz) => (
        <mesh key={dz} position={[xEntrada + largo / 2, 0.25, z + dz]}>
          <boxGeometry args={[largo, 0.1, 0.1]} />
          <meshStandardMaterial color="#566173" />
        </mesh>
      ))}
      {/* Clasificador, junto a la salida */}
      <mesh position={[xSalida + 0.6, 0.6, z]} castShadow>
        <boxGeometry args={[0.6, 1.2, 1.2]} />
        <meshStandardMaterial color="#7a5af5" />
      </mesh>
      <Etiqueta posicion={[xEntrada - 0.5, 0.3, z - 0.9]}>Eventos (FIFO) · entra</Etiqueta>
      <Etiqueta posicion={[xSalida + 0.6, 2.6, z]}>sale → clasificador</Etiqueta>

      {eventos.map((evento, i) => (
        <CajaMovil
          // Una máquina solo tiene una alarma activa: máquina y tick identifican al evento.
          key={`${evento.indiceMaquina}-${evento.tick}`}
          origen={[xEntrada, 0.45, z]}
          destino={[xSalida - 0.6 - i * PASO, 0.45, z]}
        >
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.5, 0.7]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={i === 0 ? 0.6 : 0.2} />
          </mesh>
          <Etiqueta posicion={[0, 0.65, 0]} className="etiqueta etiqueta-caja">
            [{evento.indiceMaquina}]
          </Etiqueta>
        </CajaMovil>
      ))}
    </group>
  )
}
