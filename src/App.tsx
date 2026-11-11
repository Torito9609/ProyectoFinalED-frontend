import { useState } from 'react'
import { Escena } from './escena/Escena'
import { usePlanta } from './estado/usePlanta'
import { Bitacora } from './hud/Bitacora'
import { Hud } from './hud/Hud'
import { PanelMaquina } from './hud/PanelMaquina'
import './hud/hud.css'

/** Raíz de la aplicación: la escena 3D de la compañía seleccionada de fondo y el HUD encima. */
function App() {
  const [idCompania, setIdCompania] = useState(0)
  /** Índice de la máquina seleccionada en el inventario, o `null`. */
  const [seleccionada, setSeleccionada] = useState<number | null>(null)
  const estado = usePlanta(idCompania)
  const { planta } = estado

  const maquina = seleccionada === null ? undefined : planta?.maquinas[seleccionada]

  function seleccionarCompania(id: number) {
    setIdCompania(id)
    setSeleccionada(null)
  }

  return (
    <>
      <Escena maquinas={planta?.maquinas ?? []} seleccionada={seleccionada} seleccionar={setSeleccionada} />
      <Hud
        planta={planta}
        companias={estado.companias}
        idCompania={idCompania}
        seleccionarCompania={seleccionarCompania}
        error={estado.error}
        aviso={estado.aviso}
        iniciar={estado.iniciar}
        pausar={estado.pausar}
        paso={estado.paso}
        reiniciar={estado.reiniciar}
        deshacer={estado.deshacer}
      />
      {planta && maquina && (
        <PanelMaquina
          key={`${planta.idCompania}-${maquina.indice}`}
          maquina={maquina}
          bloqueada={planta.enQuiebra}
          cerrar={() => setSeleccionada(null)}
          inyectarFallo={(sensor, magnitud) => estado.inyectarFallo(maquina.indice, sensor, magnitud)}
          pararOArrancar={() => estado.pararOArrancar(maquina.indice)}
          cambiarCarga={(carga) => estado.cambiarCarga(maquina.indice, carga)}
        />
      )}
      {planta && <Bitacora lineas={planta.bitacora} />}
    </>
  )
}

export default App
