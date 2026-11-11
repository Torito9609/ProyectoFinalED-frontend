import { CajaMovil } from './CajaMovil'
import { Etiqueta } from './Etiqueta'

interface PropsPilaDeshacer {
  /** Las acciones apiladas; la primera es la cima. */
  acciones: string[]
  /** Lugar del escritorio en el piso. */
  posicion: [number, number, number]
}

/** Altura del escritorio, donde se apoya la primera carpeta. */
const ALTO_ESCRITORIO = 0.8
/** Grosor de cada carpeta. */
const GROSOR = 0.14

/**
 * La pila de deshacer como un montón de carpetas sobre el escritorio del operador. Cada acción es una
 * carpeta; la **cima** queda arriba y es la única que se puede tocar: la próxima en deshacerse.
 *
 * Al ejecutar una acción, su carpeta cae sobre la pila; al deshacer, desaparece la de arriba. Cada carpeta
 * se identifica por su posición desde el fondo, porque la pila solo cambia por arriba: las de abajo nunca
 * se mueven.
 */
export function PilaDeshacer({ acciones, posicion }: PropsPilaDeshacer) {
  const tamano = acciones.length
  const altoPila = ALTO_ESCRITORIO + tamano * GROSOR

  return (
    <group position={posicion}>
      {/* Escritorio */}
      <mesh position={[0, ALTO_ESCRITORIO / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, ALTO_ESCRITORIO, 1.2]} />
        <meshStandardMaterial color="#6b5440" />
      </mesh>
      {acciones.map((_, i) => {
        // i = 0 es la cima; desde el fondo es la posición tamano − 1 − i.
        const desdeElFondo = tamano - 1 - i
        const y = ALTO_ESCRITORIO + GROSOR / 2 + desdeElFondo * GROSOR
        const esCima = i === 0
        return (
          <CajaMovil key={desdeElFondo} origen={[0, y + 1.5, 0]} destino={[0, y, 0]}>
            <mesh castShadow rotation={[0, desdeElFondo % 2 === 0 ? 0.05 : -0.05, 0]}>
              <boxGeometry args={[1, GROSOR * 0.85, 0.75]} />
              <meshStandardMaterial
                color={esCima ? '#f2c94c' : '#d9b65a'}
                emissive={esCima ? '#f2c94c' : '#000000'}
                emissiveIntensity={esCima ? 0.35 : 0}
              />
            </mesh>
          </CajaMovil>
        )
      })}
      <Etiqueta posicion={[0, altoPila + 0.6, 0]}>
        Pila de deshacer · {tamano}
        {tamano > 0 && (
          <>
            <br />
            cima: {acciones[0]}
          </>
        )}
      </Etiqueta>
    </group>
  )
}
