import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import type { Maquina } from '../api/tipos'
import { MaquinaModelo } from './MaquinaModelo'
import './escena.css'

/** Máquinas por fila en el piso. */
const COLUMNAS = 3
/** Distancia entre los centros de dos máquinas vecinas. */
const SEPARACION = 4
/**
 * Cuánto se acerca el diorama a la cámara, en x y en z. En la vista isométrica, acercarlo lo baja en
 * pantalla: así la fila de atrás (la máquina 0) no queda debajo de la barra superior del HUD.
 */
const DESPLAZAMIENTO = 2

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
  /** Índice de la máquina seleccionada, o `null`. */
  seleccionada: number | null
  seleccionar: (indice: number | null) => void
}

/**
 * El mundo 3D: cámara isométrica fija, luces, piso y las máquinas.
 *
 * La cámara es ortográfica (sin perspectiva) y mira al origen desde la diagonal (1, 1, 1): esa es la
 * vista isométrica. No hay controles de cámara: el diorama siempre se ve igual.
 *
 * Un clic en una máquina la selecciona; un clic en el vacío quita la selección.
 */
export function Escena({ maquinas, seleccionada, seleccionar }: PropsEscena) {
  const filas = Math.max(1, Math.ceil(maquinas.length / COLUMNAS))
  /**
   * Contenedor fijo para las etiquetas HTML. Sin él, cada etiqueta (`Html` de drei) elige su contenedor
   * al montarse y lo cambia cuando React Three Fiber conecta sus eventos; al cambiarlo rehace su raíz de
   * React en medio de un render, y en esa carrera la primera etiqueta quedaba vacía.
   */
  const capaEtiquetas = useRef<HTMLDivElement>(null)

  return (
    <div ref={capaEtiquetas} className="escena">
      <Canvas
        shadows
        orthographic
        camera={{ position: [20, 20, 20], zoom: 45 }}
        onPointerMissed={() => seleccionar(null)}
      >
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
        <group position={[DESPLAZAMIENTO, 0, DESPLAZAMIENTO]}>
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
              seleccionada={maquina.indice === seleccionada}
              alSeleccionar={() => seleccionar(maquina.indice)}
              capaEtiquetas={capaEtiquetas}
            />
          ))}
        </group>
      </Canvas>
    </div>
  )
}
