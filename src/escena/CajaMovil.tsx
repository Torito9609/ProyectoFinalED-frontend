import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Group } from 'three'

interface PropsCajaMovil {
  /** Donde debe quedar la caja. Si cambia, la caja se desliza hasta allí. */
  destino: [number, number, number]
  /** Donde aparece la caja al crearse: la entrada de su cola. */
  origen: [number, number, number]
  /** Lo que se dibuja (la caja y su etiqueta), con coordenadas relativas a la caja. */
  children: ReactNode
}

/** Qué tan rápido se acerca la caja a su destino (por segundo). */
const RAPIDEZ = 6

/**
 * Un elemento de una cola que se desliza hasta su lugar. Cuando sale el frente, los que quedan se mueven
 * un puesto hacia la salida: así se ve el comportamiento FIFO en vez de un salto.
 *
 * La animación es solo visual: la posición final la decide el orden de la lista que entrega el backend.
 */
export function CajaMovil({ destino, origen, children }: PropsCajaMovil) {
  const grupo = useRef<Group>(null)
  // La posición inicial se fija al crear la caja; después solo la mueve el cuadro a cuadro.
  const [inicial] = useState(origen)

  useFrame((_, delta) => {
    if (!grupo.current) return
    // Se acerca una fracción de la distancia que falta en cada cuadro, sin depender de los cuadros por segundo.
    const avance = 1 - Math.exp(-RAPIDEZ * delta)
    grupo.current.position.x += (destino[0] - grupo.current.position.x) * avance
    grupo.current.position.y += (destino[1] - grupo.current.position.y) * avance
    grupo.current.position.z += (destino[2] - grupo.current.position.z) * avance
  })

  return (
    <group ref={grupo} position={inicial}>
      {children}
    </group>
  )
}
