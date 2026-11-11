import type { ResumenPartida as Resumen } from '../api/tipos'
import { NOMBRE_MODO } from '../colores'
import { dinero, porcentaje } from '../formato'

interface PropsResumenPartida {
  resumen: Resumen
  cerrar: () => void
  reiniciar: () => void
}

/**
 * El resultado de la partida, compañía por compañía. Se abre solo al terminar la partida, y también con el
 * botón Resumen en cualquier momento (entonces son los números hasta el tick actual).
 */
export function ResumenPartida({ resumen, cerrar, reiniciar }: PropsResumenPartida) {
  return (
    <div className="fondo-modal" onClick={cerrar}>
      <div className="panel modal" onClick={(e) => e.stopPropagation()}>
        <div className="encabezado">
          <span>{resumen.terminada ? 'Partida terminada' : 'Resumen de la partida'}</span>
          <button className="cerrar" onClick={cerrar} title="Cerrar">
            ✕
          </button>
        </div>
        <div className="suave">
          Tick {resumen.tick} / {resumen.duracionPartida} · modo {NOMBRE_MODO[resumen.modo].toLowerCase()}
        </div>
        <table className="tabla">
          <thead>
            <tr>
              <th>Compañía</th>
              <th>Caja</th>
              <th>Producción</th>
              <th>Costos</th>
              <th>Fallos</th>
              <th>Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {resumen.companias.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.nombre}
                  {c.enQuiebra && <span className="etiqueta-quiebra">quiebra</span>}
                </td>
                <td className={c.caja < 0 ? 'negativo' : undefined}>{dinero(c.caja)}</td>
                <td>{dinero(c.ingresos)}</td>
                <td>{dinero(c.costos)}</td>
                <td>{c.numeroFallos}</td>
                <td>{porcentaje(c.disponibilidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fila derecha">
          {resumen.terminada && <button onClick={reiniciar}>Nueva partida (reiniciar)</button>}
          <button onClick={cerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
