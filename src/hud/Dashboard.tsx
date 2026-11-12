import { useState } from 'react'
import * as api from '../api/cliente'
import type { TipoMaquina } from '../api/tipos'
import { useSuperusuario } from '../estado/useSuperusuario'
import type { FiltroRanking } from '../estado/useSuperusuario'
import { FormulariosCreacion } from './FormulariosCreacion'
import { GraficaHistorial } from './GraficaHistorial'
import { PanelOverhauls } from './PanelOverhauls'
import { TablaRanking } from './TablaRanking'
import { TarjetaCompania } from './TarjetaCompania'

interface PropsDashboard {
  /** Abre una compañía en el diorama. */
  abrirCompania: (id: number) => void
  /** Avisa que se creó una compañía, para refrescar las pestañas. */
  companiaCreada: () => void
  /** Muestra el mensaje de una acción rechazada (por ejemplo un 409). */
  avisar: (mensaje: string) => void
}

/**
 * La vista del superusuario: todas las compañías con sus totales, el ranking de fallos con sus acciones
 * (aprobar overhaul y reemplazar), el montículo de overhauls con los técnicos del fabricante y los
 * formularios para crear compañías y máquinas, y la gráfica del historial por ventana de ticks. Es HTML, sin
 * escena 3D.
 */
export function Dashboard({ abrirCompania, companiaCreada, avisar }: PropsDashboard) {
  const [filtro, setFiltro] = useState<FiltroRanking>({ idCompania: null, soloCandidatas: false })
  const { companias, ranking, overhauls, catalogo, refrescar } = useSuperusuario(filtro)

  /** Las máquinas que ya tienen una solicitud en el montículo, para deshabilitar "Aprobar". */
  const pendientes = new Set(overhauls?.ordenDeSalida.map((s) => `${s.idCompania}-${s.indiceMaquina}`) ?? [])

  /** Ejecuta una acción del superusuario y refresca; si el backend la rechaza, muestra su mensaje. */
  async function accion(peticion: () => Promise<unknown>) {
    try {
      await peticion()
      await refrescar()
    } catch (e) {
      avisar(e instanceof Error ? e.message : String(e))
    }
  }

  async function crearCompania(nombre: string) {
    await api.crearCompania(nombre)
    companiaCreada()
    await refrescar()
  }

  async function crearMaquina(idCompania: number, tipo: TipoMaquina, etiqueta: string) {
    await api.crearMaquina(idCompania, tipo, etiqueta)
    await refrescar()
  }

  return (
    <div className="dashboard">
      <div className="tarjetas">
        {companias.map((compania) => (
          <TarjetaCompania key={compania.id} compania={compania} abrir={() => abrirCompania(compania.id)} />
        ))}
      </div>
      <div className="columnas">
        <TablaRanking
          ranking={ranking}
          companias={companias}
          filtro={filtro}
          cambiarFiltro={setFiltro}
          pendientes={pendientes}
          aprobarOverhaul={(id, indice) => accion(() => api.aprobarOverhaul(id, indice))}
          reemplazar={(id, indice) => accion(() => api.reemplazarMaquina(id, indice))}
        />
        <div className="columna-derecha">
          <PanelOverhauls overhauls={overhauls} despacharCamion={() => accion(api.asignarSiguienteOverhaul)} />
          <FormulariosCreacion
            companias={companias}
            catalogo={catalogo}
            ranking={ranking}
            crearCompania={crearCompania}
            crearMaquina={crearMaquina}
          />
        </div>
      </div>
      <GraficaHistorial companias={companias} />
    </div>
  )
}
