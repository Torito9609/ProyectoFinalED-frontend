import type { EstadoMaquina, ResumenCompania } from '../api/tipos'
import { COLOR_ESTADO, NOMBRE_ESTADO } from '../colores'
import { dinero, porcentaje } from '../formato'

interface PropsTarjetaCompania {
  compania: ResumenCompania
  /** Abre esta compañía en el diorama. */
  abrir: () => void
}

/**
 * Los totales de una compañía para el dashboard. La barra de colores muestra cuántas máquinas hay en cada
 * estado. Un clic abre la compañía en el diorama.
 */
export function TarjetaCompania({ compania, abrir }: PropsTarjetaCompania) {
  const estados = Object.entries(compania.maquinasPorEstado) as [EstadoMaquina, number][]
  return (
    <button className={`panel tarjeta ${compania.enQuiebra ? 'en-quiebra' : ''}`} onClick={abrir}>
      <div className="encabezado">
        <span>
          <span className="suave">#{compania.id}</span> {compania.nombre}
        </span>
        {compania.enQuiebra && <span className="etiqueta-quiebra">quiebra</span>}
      </div>
      <div className={`caja ${compania.caja < 0 ? 'negativo' : ''}`}>{dinero(compania.caja)}</div>
      <div className="barra-estados" title="Máquinas por estado">
        {estados
          .filter(([, cantidad]) => cantidad > 0)
          .map(([estado, cantidad]) => (
            <span
              key={estado}
              style={{ flex: cantidad, background: COLOR_ESTADO[estado] }}
              title={`${NOMBRE_ESTADO[estado]}: ${cantidad}`}
            />
          ))}
      </div>
      <dl className="datos">
        <dt>Máquinas</dt>
        <dd>{compania.numeroMaquinas}</dd>
        <dt>Eventos / órdenes</dt>
        <dd>
          {compania.eventosPendientes} / {compania.ordenesPendientes}
        </dd>
        <dt>Técnicos libres</dt>
        <dd>{compania.tecnicosLibres}</dd>
        <dt>Fallos</dt>
        <dd>{compania.numeroFallos}</dd>
        <dt>Disponibilidad</dt>
        <dd>{porcentaje(compania.disponibilidad)}</dd>
      </dl>
    </button>
  )
}
