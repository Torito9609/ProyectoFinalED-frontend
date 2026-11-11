import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useRef } from 'react'
import type { MeshStandardMaterial } from 'three'
import type { Maquina } from '../api/tipos'
import { COLOR_ESTADO, NOMBRE_ESTADO } from '../colores'
import { Etiqueta } from './Etiqueta'

interface PropsMaquinaModelo {
  maquina: Maquina
  posicion: [number, number, number]
  alSeleccionar: () => void
}

/**
 * Una máquina low-poly: base, cuerpo y una baliza con el color de su estado.
 *
 * En EN_ALARMA la baliza parpadea. Encima lleva la etiqueta con su índice en el inventario
 * (`[0] PRENSA-01`), porque las máquinas se identifican por su posición en el `ArrayList`.
 *
 * Al hacer clic se selecciona; la escena dibuja entonces su cola circular alrededor de ella.
 */
export function MaquinaModelo({ maquina, posicion, alSeleccionar }: PropsMaquinaModelo) {
  const baliza = useRef<MeshStandardMaterial>(null)
  const color = COLOR_ESTADO[maquina.estado]
  const enAlarma = maquina.estado === 'EN_ALARMA'

  // Parpadeo de la baliza: se cambia el brillo en cada cuadro sin volver a renderizar React.
  useFrame(({ clock }) => {
    if (!baliza.current) return
    baliza.current.emissiveIntensity = enAlarma && Math.sin(clock.elapsedTime * 8) < 0 ? 0.1 : 1.2
  })

  function alHacerClic(evento: ThreeEvent<MouseEvent>) {
    // Sin esto, el clic también llegaría al lienzo y quitaría la selección.
    evento.stopPropagation()
    alSeleccionar()
  }

  return (
    <group
      position={posicion}
      onClick={alHacerClic}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.3, 2.4]} />
        <meshStandardMaterial color="#3a4452" />
      </mesh>
      {/* Cuerpo */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.4, 1.6]} />
        <meshStandardMaterial color="#c9ced6" />
      </mesh>
      {/* Baliza */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 12]} />
        <meshStandardMaterial ref={baliza} color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      <Etiqueta posicion={[0, 2.6, 0]} className="etiqueta-maquina">
        <div>
          <span className="indice">[{maquina.indice}]</span> {maquina.etiqueta}
        </div>
        <div className="estado" style={{ color }}>
          {NOMBRE_ESTADO[maquina.estado]}
        </div>
      </Etiqueta>
    </group>
  )
}
