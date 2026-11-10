import { Canvas } from '@react-three/fiber'
import { usePlanta } from './estado/usePlanta'
import { Bitacora } from './hud/Bitacora'
import { Hud } from './hud/Hud'
import './hud/hud.css'

/**
 * Raíz de la aplicación: la escena 3D de fondo y el HUD encima.
 *
 * La caja es provisional: la escena isométrica de la planta llega en el siguiente commit.
 */
function App() {
  const { planta, error, iniciar, pausar, paso, reiniciar } = usePlanta()

  return (
    <>
      <Canvas camera={{ position: [3, 3, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 3]} />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="#f5a524" />
        </mesh>
      </Canvas>
      <Hud
        planta={planta}
        error={error}
        iniciar={iniciar}
        pausar={pausar}
        paso={paso}
        reiniciar={reiniciar}
      />
      {planta && <Bitacora lineas={planta.bitacora} />}
    </>
  )
}

export default App
