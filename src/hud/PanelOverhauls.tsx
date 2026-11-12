import type { EstadoOverhauls, SolicitudOverhaul } from '../api/tipos'
import { NOMBRE_MODO } from '../colores'
import { dinero } from '../formato'

interface PropsPanelOverhauls {
  overhauls: EstadoOverhauls | null
  /** Modo manual: el montículo entrega su cima a un técnico del fabricante. */
  despacharCamion: () => void
}

/** Texto de una solicitud: compañía, máquina y la clave del montículo. */
function Solicitud({ solicitud }: { solicitud: SolicitudOverhaul }) {
  return (
    <>
      <span>
        <span className="suave">{solicitud.nombreCompania} ·</span> [{solicitud.indiceMaquina}] {solicitud.etiqueta}
      </span>
      <span className="clave" title="Puntaje congelado al aprobar (clave) · secuencia (desempate)">
        {solicitud.puntajeCongelado} · #{solicitud.secuencia}
      </span>
    </>
  )
}

/**
 * Las solicitudes de overhaul y los técnicos del fabricante, compartidos por todas las compañías.
 *
 * El montículo (`PriorityQueue`) no expone su arreglo interno, así que no se dibuja el árbol: se muestra la
 * **cima** (`peek`) resaltada y el **orden de salida**, que el backend calcula extrayendo de una copia. La
 * clave de cada solicitud es su puntaje congelado al aprobarla; en un empate sale la de menor secuencia,
 * la que se aprobó antes.
 *
 * Los técnicos libres forman una cola FIFO: el primero recibe el próximo overhaul. Los ocupados muestran su
 * máquina y los ticks que les faltan.
 *
 * "Despachar camión" solo funciona en modo manual; en automático, el tick despacha solo. Se deshabilita si
 * no hay solicitudes o no hay técnicos libres. Si la máquina de la cima no está libre, el backend responde
 * 409: el camión espera, no se salta a la segunda solicitud.
 */
export function PanelOverhauls({ overhauls, despacharCamion }: PropsPanelOverhauls) {
  if (!overhauls) return <div className="panel overhauls suave">Cargando overhauls…</div>

  const manual = overhauls.modo === 'MANUAL'
  const ocupados = overhauls.tecnicos.filter((t) => !t.libre)
  const puedeDespachar = manual && overhauls.cima !== null && overhauls.tecnicosLibres.length > 0

  return (
    <div className="panel overhauls">
      <div className="encabezado">
        <span>Overhauls</span>
        <span className="suave">
          {overhauls.duracionOverhaul} ticks · {dinero(overhauls.costoOverhaul)} · reemplazo{' '}
          {dinero(overhauls.costoReemplazo)}
        </span>
      </div>

      <div className="seccion">Montículo de solicitudes (orden de salida)</div>
      {overhauls.ordenDeSalida.length === 0 ? (
        <div className="suave vacio">No hay solicitudes aprobadas</div>
      ) : (
        <ol className="lista-salida">
          {overhauls.ordenDeSalida.map((solicitud, i) => (
            <li key={solicitud.secuencia} className={i === 0 ? 'cima' : ''}>
              {i === 0 && <span className="insignia-cima">cima</span>}
              <Solicitud solicitud={solicitud} />
            </li>
          ))}
        </ol>
      )}

      <div className="seccion">Técnicos del fabricante</div>
      <div className="fila">
        <span className="suave">Libres (FIFO):</span>
        {overhauls.tecnicosLibres.length === 0 ? (
          <span className="suave">ninguno</span>
        ) : (
          overhauls.tecnicosLibres.map((nombre, i) => (
            <span key={nombre} className={`ficha ${i === 0 ? 'frente' : ''}`} title={i === 0 ? 'Frente de la cola' : undefined}>
              {nombre}
            </span>
          ))
        )}
      </div>
      {ocupados.map((tecnico) => (
        <div key={tecnico.nombre} className="fila ocupado">
          <span className="ficha">{tecnico.nombre}</span>
          {tecnico.solicitudActual && (
            <span>
              🚚 {tecnico.solicitudActual.nombreCompania} · [{tecnico.solicitudActual.indiceMaquina}]{' '}
              {tecnico.solicitudActual.etiqueta}
            </span>
          )}
          <span className="suave">faltan {tecnico.ticksRestantes} ticks</span>
        </div>
      ))}

      <div className="fila">
        <button
          disabled={!puedeDespachar}
          title={
            !manual
              ? `En modo ${NOMBRE_MODO[overhauls.modo]} el tick despacha solo`
              : 'Saca la cima del montículo y le asigna el primer técnico libre'
          }
          onClick={despacharCamion}
        >
          🚚 Despachar camión
        </button>
        {!manual && <span className="suave">Solo en modo manual</span>}
      </div>
    </div>
  )
}
