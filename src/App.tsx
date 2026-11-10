import { Escena } from './escena/Escena'
import { usePlanta } from './estado/usePlanta'
import { Bitacora } from './hud/Bitacora'
import { Hud } from './hud/Hud'
import './hud/hud.css'

/** Raíz de la aplicación: la escena 3D de fondo y el HUD encima. */
function App() {
  const { planta, error, iniciar, pausar, paso, reiniciar } = usePlanta()

  return (
    <>
      <Escena maquinas={planta?.maquinas ?? []} />
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
