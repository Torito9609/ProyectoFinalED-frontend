import { Canvas } from '@react-three/fiber'

/**
 * Raíz de la aplicación.
 *
 * Por ahora solo comprueba que React Three Fiber funciona: dibuja una caja iluminada.
 * La escena isométrica de la planta y el HUD llegan en los siguientes commits del hito 1.
 */
function App() {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="#f5a524" />
      </mesh>
    </Canvas>
  )
}

export default App
