import { Html } from '@react-three/drei'
import { useContext } from 'react'
import type { ReactNode, RefObject } from 'react'
import { CapaEtiquetas } from './capaEtiquetas'

interface PropsEtiqueta {
  posicion: [number, number, number]
  className?: string
  children: ReactNode
}

/** Texto HTML anclado a un punto de la escena 3D, siempre de frente a la cámara. */
export function Etiqueta({ posicion, className = 'etiqueta', children }: PropsEtiqueta) {
  const capa = useContext(CapaEtiquetas)
  return (
    <Html
      position={posicion}
      center
      // drei declara el contenedor sin `null`; cuando la etiqueta se monta, la capa ya existe.
      portal={capa as RefObject<HTMLElement> | undefined}
      zIndexRange={[5, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className={className}>{children}</div>
    </Html>
  )
}
