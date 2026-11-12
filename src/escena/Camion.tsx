import { COLOR_ESTADO } from '../colores'
import { CajaMovil } from './CajaMovil'

interface PropsCamion {
  /** Donde se estaciona: junto a la máquina en overhaul. */
  destino: [number, number, number]
  /** Donde aparece: fuera del piso, para que se vea llegar. */
  origen: [number, number, number]
}

/** Color del camión: el mismo morado del estado EN_OVERHAUL. */
const COLOR_CAMION = COLOR_ESTADO.EN_OVERHAUL

/** Una rueda: un cilindro acostado a lo ancho del camión. */
function Rueda({ posicion }: { posicion: [number, number, number] }) {
  return (
    <mesh position={posicion} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.17, 0.17, 0.12, 12]} />
      <meshStandardMaterial color="#1a1f27" />
    </mesh>
  )
}

/**
 * El camión del fabricante, estacionado junto a una máquina EN_OVERHAUL. Es solo decoración: el backend
 * no manda dónde está el camión, solo que la máquina está en overhaul. Entra desde el borde del piso con
 * `CajaMovil` y desaparece cuando la máquina vuelve a operar.
 *
 * El camión va a lo largo del eje z (de frente hacia la cámara), para caber en el pasillo entre dos
 * columnas de máquinas. No lleva etiqueta: con las máquinas tan juntas se encimaba con las de ellas, y su
 * color morado es el del estado EN_OVERHAUL que ya dice la etiqueta de la máquina.
 */
export function Camion({ destino, origen }: PropsCamion) {
  return (
    <CajaMovil origen={origen} destino={destino}>
      {/* Caja de carga, atrás */}
      <mesh position={[0, 0.6, -0.25]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.8, 1.2]} />
        <meshStandardMaterial color={COLOR_CAMION} />
      </mesh>
      {/* Cabina, adelante */}
      <mesh position={[0, 0.45, 0.62]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.55, 0.5]} />
        <meshStandardMaterial color="#e6e8ec" />
      </mesh>
      {/* Parabrisas */}
      <mesh position={[0, 0.55, 0.875]}>
        <boxGeometry args={[0.7, 0.25, 0.02]} />
        <meshStandardMaterial color="#5a7896" />
      </mesh>
      <Rueda posicion={[0.46, 0.17, -0.5]} />
      <Rueda posicion={[-0.46, 0.17, -0.5]} />
      <Rueda posicion={[0.46, 0.17, 0.6]} />
      <Rueda posicion={[-0.46, 0.17, 0.6]} />
    </CajaMovil>
  )
}
