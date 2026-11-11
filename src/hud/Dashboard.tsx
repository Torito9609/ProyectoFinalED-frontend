import { useState } from 'react'
import * as api from '../api/cliente'
import type { TipoMaquina } from '../api/tipos'
import { useSuperusuario } from '../estado/useSuperusuario'
import type { FiltroRanking } from '../estado/useSuperusuario'
import { FormulariosCreacion } from './FormulariosCreacion'
import { TablaRanking } from './TablaRanking'
import { TarjetaCompania } from './TarjetaCompania'

interface PropsDashboard {
  /** Abre una compañía en el diorama. */
  abrirCompania: (id: number) => void
  /** Avisa que se creó una compañía, para refrescar las pestañas. */
  companiaCreada: () => void
}

/**
 * La vista del superusuario: todas las compañías con sus totales, los formularios para crear compañías y
 * máquinas, y el ranking de fallos. Es HTML, sin escena 3D.
 */
export function Dashboard({ abrirCompania, companiaCreada }: PropsDashboard) {
  const [filtro, setFiltro] = useState<FiltroRanking>({ idCompania: null, soloCandidatas: false })
  const { companias, ranking, catalogo, refrescar } = useSuperusuario(filtro)

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
        <TablaRanking ranking={ranking} companias={companias} filtro={filtro} cambiarFiltro={setFiltro} />
        <FormulariosCreacion
          companias={companias}
          catalogo={catalogo}
          ranking={ranking}
          crearCompania={crearCompania}
          crearMaquina={crearMaquina}
        />
      </div>
    </div>
  )
}
