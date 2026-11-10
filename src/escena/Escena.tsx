import { Canvas } from '@react-three/fiber'
import type { Maquina } from '../api/tipos'
import { MaquinaModelo } from './MaquinaModelo'
import './escena.css'

/** Máquinas por fila en el piso. */
const COLUMNAS = 3
/** Distancia entre los centros de dos máquinas vecinas. */
const SEPARACION = 4

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

/**
 * El mundo 3D: cámara isométrica fija, luces, piso y las máquinas.
 *
 * La cámara es ortográfica (sin perspectiva) y mira al origen desde la diagonal (1, 1, 1): esa es la
 * vista isométrica. No hay controles de cámara: el diorama siempre se ve igual.
 */
export function Escena({ maquinas }: { maquinas: Maquina[] }) {
  const filas = Math.max(1, Math.ceil(maquinas.length / COLUMNAS))

  return (
    <Canvas shadows orthographic camera={{ position: [20, 20, 20], zoom: 45 }}>
      <color attach="background" args={['#1e2530']} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[8, 14, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[COLUMNAS * SEPARACION + 2, filas * SEPARACION + 2]} />
        <meshStandardMaterial color="#2a3240" />
      </mesh>
      {maquinas.map((maquina) => (
        <MaquinaModelo
          key={maquina.indice}
          maquina={maquina}
          posicion={posicionDe(maquina.indice, maquinas.length)}
        />
      ))}
    </Canvas>
  )
}
