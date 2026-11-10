import { useState } from 'react'
import { Escena } from './escena/Escena'
import { usePlanta } from './estado/usePlanta'
import { Bitacora } from './hud/Bitacora'
import { Hud } from './hud/Hud'
import './hud/hud.css'

/** Raíz de la aplicación: la escena 3D de la compañía seleccionada de fondo y el HUD encima. */
function App() {
  const [idCompania, setIdCompania] = useState(0)
  const { planta, companias, error, iniciar, pausar, paso, reiniciar } = usePlanta(idCompania)

  return (
    <>
      <Escena maquinas={planta?.maquinas ?? []} />
      <Hud
        planta={planta}
        companias={companias}
        idCompania={idCompania}
        seleccionarCompania={setIdCompania}
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
