import type { Ranking, ResumenCompania } from '../api/tipos'
import { COLOR_ESTADO, COLOR_RECOMENDACION, NOMBRE_ESTADO } from '../colores'
import type { FiltroRanking } from '../estado/useSuperusuario'

interface PropsTablaRanking {
  ranking: Ranking | null
  companias: ResumenCompania[]
  filtro: FiltroRanking
  cambiarFiltro: (filtro: FiltroRanking) => void
}

/**
 * El ranking de fallos: las máquinas de mayor a menor puntaje, como las recorre en orden el árbol
 * rojo-negro (`TreeSet`) del backend. El frontend no ordena nada.
 *
 * "Solo candidatas" pide las máquinas con puntaje ≥ umbral de overhaul: es la consulta por rango del
 * árbol. Cada fila trae su recomendación (overhaul o reemplazo), que es solo una sugerencia.
 */
export function TablaRanking({ ranking, companias, filtro, cambiarFiltro }: PropsTablaRanking) {
  return (
    <div className="panel ranking">
      <div className="encabezado">
        <span>Ranking de fallos</span>
        <span className="suave">
          {ranking && `umbral de overhaul ${ranking.umbralOverhaul} · máximo ${ranking.maximoOverhauls} overhaul`}
        </span>
      </div>
      <div className="fila">
        <select
          value={filtro.idCompania ?? ''}
          onChange={(e) =>
            cambiarFiltro({ ...filtro, idCompania: e.target.value === '' ? null : Number(e.target.value) })
          }
        >
          <option value="">Global (todas las compañías)</option>
          {companias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={filtro.soloCandidatas}
            onChange={(e) => cambiarFiltro({ ...filtro, soloCandidatas: e.target.checked })}
          />{' '}
          Solo candidatas (puntaje ≥ umbral)
        </label>
      </div>
      <div className="contenedor-tabla">
        <table className="tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Máquina</th>
              <th>Compañía</th>
              <th>Estado</th>
              <th>Puntaje</th>
              <th>Overhauls</th>
              <th>Recomendación</th>
            </tr>
          </thead>
          <tbody>
            {ranking?.maquinas.map((m) => (
              <tr key={`${m.idCompania}-${m.indice}`}>
                <td>{m.posicion}</td>
                <td>
                  <span className="suave">[{m.indice}]</span> {m.etiqueta}
                </td>
                <td>{m.nombreCompania}</td>
                <td style={{ color: COLOR_ESTADO[m.estado] }}>{NOMBRE_ESTADO[m.estado]}</td>
                <td>{m.puntajeFallos}</td>
                <td>{m.numeroOverhauls}</td>
                <td>
                  {m.recomendacion !== 'NINGUNA' && (
                    <span className="insignia" style={{ background: COLOR_RECOMENDACION[m.recomendacion] }}>
                      {m.recomendacion}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ranking && ranking.maquinas.length === 0 && <div className="suave vacio">Ninguna máquina en este rango</div>}
      </div>
    </div>
  )
}
