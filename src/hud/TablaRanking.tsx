import type { Ranking, ResumenCompania } from '../api/tipos'
import { COLOR_ESTADO, COLOR_RECOMENDACION, NOMBRE_ESTADO } from '../colores'
import type { FiltroRanking } from '../estado/useSuperusuario'
import { estaLibre } from '../reglas'

interface PropsTablaRanking {
  ranking: Ranking | null
  companias: ResumenCompania[]
  filtro: FiltroRanking
  cambiarFiltro: (filtro: FiltroRanking) => void
  /** Máquinas con una solicitud esperando en el montículo, como `"idCompania-indice"`. */
  pendientes: Set<string>
  aprobarOverhaul: (idCompania: number, indice: number) => void
  reemplazar: (idCompania: number, indice: number) => void
}

/**
 * El ranking de fallos: las máquinas de mayor a menor puntaje, como las recorre en orden el árbol
 * rojo-negro (`TreeSet`) del backend. El frontend no ordena nada.
 *
 * "Solo candidatas" pide las máquinas con puntaje ≥ umbral de overhaul: es la consulta por rango del
 * árbol. Cada fila trae su recomendación (overhaul o reemplazo), que es solo una sugerencia: el jugador
 * decide si aprueba el overhaul o reemplaza, y paga.
 *
 * Los botones se deshabilitan en los casos en que el backend respondería 409: "Aprobar" sin recomendación,
 * con una solicitud ya pendiente o con la compañía en quiebra; "Reemplazar" sin recomendación de reemplazo
 * o con la máquina ocupada.
 */
export function TablaRanking(props: PropsTablaRanking) {
  const { ranking, companias, filtro, cambiarFiltro, pendientes } = props
  const enQuiebra = new Set(companias.filter((c) => c.enQuiebra).map((c) => c.id))
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ranking?.maquinas.map((m) => {
              const pendiente = pendientes.has(`${m.idCompania}-${m.indice}`)
              const quiebra = enQuiebra.has(m.idCompania)
              const puedeAprobar = m.recomendacion !== 'NINGUNA' && !pendiente && !quiebra
              const puedeReemplazar = m.recomendacion === 'REEMPLAZO' && estaLibre(m.estado) && !quiebra
              return (
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
                    {pendiente && <span className="suave"> en espera</span>}
                  </td>
                  <td className="acciones">
                    {m.recomendacion !== 'NINGUNA' && (
                      <button disabled={!puedeAprobar} onClick={() => props.aprobarOverhaul(m.idCompania, m.indice)}>
                        Aprobar overhaul
                      </button>
                    )}
                    {m.recomendacion === 'REEMPLAZO' && (
                      <button
                        disabled={!puedeReemplazar}
                        title={estaLibre(m.estado) ? undefined : 'La máquina no está libre'}
                        onClick={() => props.reemplazar(m.idCompania, m.indice)}
                      >
                        Reemplazar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {ranking && ranking.maquinas.length === 0 && <div className="suave vacio">Ninguna máquina en este rango</div>}
      </div>
    </div>
  )
}
