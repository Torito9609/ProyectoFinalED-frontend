import { useState } from 'react'
import { Escena } from './escena/Escena'
import { usePlanta } from './estado/usePlanta'
import { Bitacora } from './hud/Bitacora'
import { Dashboard } from './hud/Dashboard'
import { Hud } from './hud/Hud'
import type { Vista } from './hud/Hud'
import { PanelJuego } from './hud/PanelJuego'
import { PanelMaquina } from './hud/PanelMaquina'
import { ResumenPartida } from './hud/ResumenPartida'
import './hud/hud.css'

/** Raíz de la aplicación: la escena 3D de la compañía seleccionada de fondo y el HUD encima. */
function App() {
  const [idCompania, setIdCompania] = useState(0)
  /** Índice de la máquina seleccionada en el inventario, o `null`. */
  const [seleccionada, setSeleccionada] = useState<number | null>(null)
  /** Sensor que se dibuja en la cola circular de la máquina seleccionada. */
  const [sensorVista, setSensorVista] = useState(0)
  const [vista, setVista] = useState<Vista>('COMPANIA')
  const estado = usePlanta(idCompania)
  const { planta } = estado

  const maquina = seleccionada === null ? undefined : planta?.maquinas[seleccionada]

  function seleccionarCompania(id: number) {
    setIdCompania(id)
    setSeleccionada(null)
  }

  /** Desde el dashboard: abre una compañía en el diorama. */
  function abrirCompania(id: number) {
    seleccionarCompania(id)
    setVista('COMPANIA')
  }

  /** Cada máquina tiene sus propios sensores: al cambiar de máquina se vuelve al primero. */
  function seleccionarMaquina(indice: number | null) {
    setSeleccionada(indice)
    setSensorVista(0)
  }

  return (
    <>
      {vista === 'COMPANIA' && (
        <Escena
          maquinas={planta?.maquinas ?? []}
          eventos={planta?.eventos ?? []}
          colaPrioridad={planta?.colaPrioridad ?? null}
          tecnicos={planta?.tecnicos ?? []}
          tecnicosLibres={planta?.tecnicosLibres ?? { MECANICO: [], ELECTRICO: [] }}
          pilaDeshacer={planta?.pilaDeshacer ?? []}
          seleccionada={seleccionada}
          seleccionar={seleccionarMaquina}
          sensorVista={sensorVista}
        />
      )}
      {vista === 'SUPERUSUARIO' && (
        <Dashboard abrirCompania={abrirCompania} companiaCreada={estado.recargarCompanias} />
      )}
      <Hud
        planta={planta}
        simulacion={estado.simulacion}
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
        cambiarModo={estado.cambiarModo}
        verResumen={estado.verResumen}
        vista={vista}
        cambiarVista={setVista}
      />
      {vista === 'COMPANIA' && planta && maquina && (
        <PanelMaquina
          key={`${planta.idCompania}-${maquina.indice}`}
          maquina={maquina}
          bloqueada={planta.enQuiebra}
          cerrar={() => seleccionarMaquina(null)}
          sensorVista={sensorVista}
          seleccionarSensor={setSensorVista}
          inyectarFallo={(sensor, magnitud) => estado.inyectarFallo(maquina.indice, sensor, magnitud)}
          pararOArrancar={() => estado.pararOArrancar(maquina.indice)}
          cambiarCarga={(carga) => estado.cambiarCarga(maquina.indice, carga)}
        />
      )}
      {vista === 'COMPANIA' && planta && <Bitacora lineas={planta.bitacora} />}
      {vista === 'COMPANIA' && planta && (
        <PanelJuego
          planta={planta}
          clasificarSiguiente={estado.clasificarSiguiente}
          asignarSiguiente={estado.asignarSiguiente}
        />
      )}
      {estado.resumen && (
        <ResumenPartida
          resumen={estado.resumen}
          cerrar={estado.cerrarResumen}
          reiniciar={() => {
            estado.cerrarResumen()
            estado.reiniciar()
          }}
        />
      )}
    </>
  )
}

export default App
