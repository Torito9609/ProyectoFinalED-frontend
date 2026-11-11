import type { EstadoPlanta, TipoFallo } from '../api/tipos'
import { NOMBRE_TIPO_FALLO } from '../colores'
import { dinero } from '../formato'

interface PropsPanelJuego {
  planta: EstadoPlanta
  clasificarSiguiente: () => void
  asignarSiguiente: (especialidad: TipoFallo) => void
}

const ESPECIALIDADES: TipoFallo[] = ['MECANICO', 'ELECTRICO']

/**
 * La economía de la compañía y los botones del modo manual (el juego de gestión).
 *
 * El jugador decide **qué** hacer y **con qué recurso**; la estructura decide **cuál** elemento sale:
 * clasificar saca el frente de la cola de eventos, y asignar saca la orden más prioritaria y el primer
 * técnico de la cola que elige el jugador. Por eso la pista muestra qué orden saldrá y qué especialidad
 * pide: con la otra, la reparación tarda el doble.
 *
 * Los botones se deshabilitan en los casos en que el backend respondería 409.
 */
export function PanelJuego({ planta, clasificarSiguiente, asignarSiguiente }: PropsPanelJuego) {
  const manual = planta.modo === 'MANUAL'
  const bloqueada = planta.enQuiebra
  const carril = planta.colaPrioridad.carriles.find((c) => c.prioridad === planta.colaPrioridad.siguiente)
  const siguiente = carril?.ordenes[0]

  return (
    <div className="panel panel-juego">
      {planta.enQuiebra && <div className="quiebra">{planta.nombre} está en quiebra: no opera ni acepta acciones</div>}
      <dl className="datos">
        <dt>Caja</dt>
        <dd className={planta.caja < 0 ? 'negativo' : 'fuerte'}>{dinero(planta.caja)}</dd>
        <dt>Ingresos</dt>
        <dd>{dinero(planta.ingresos)}</dd>
        <dt>Costos</dt>
        <dd>{dinero(planta.costos)}</dd>
      </dl>

      {manual ? (
        <>
          <div className="seccion">Modo manual</div>
          <button
            disabled={bloqueada || planta.eventos.length === 0}
            onClick={clasificarSiguiente}
          >
            Clasificar siguiente evento ({planta.eventos.length})
          </button>
          <div className="pista">
            {siguiente
              ? `Siguiente: OT-${siguiente.id} · ${siguiente.prioridad} · ${siguiente.etiquetaMaquina} · pide ${NOMBRE_TIPO_FALLO[siguiente.tipoFallo]}`
              : 'No hay órdenes por asignar'}
          </div>
          <div className="fila">
            {ESPECIALIDADES.map((especialidad) => {
              const libres = planta.tecnicosLibres[especialidad].length
              return (
                <button
                  key={especialidad}
                  disabled={bloqueada || !siguiente || libres === 0}
                  className={siguiente && siguiente.tipoFallo !== especialidad ? 'penalidad' : undefined}
                  title={
                    siguiente && siguiente.tipoFallo !== especialidad
                      ? 'Especialidad distinta: la reparación tarda el doble'
                      : undefined
                  }
                  onClick={() => asignarSiguiente(especialidad)}
                >
                  Asignar a {NOMBRE_TIPO_FALLO[especialidad].toLowerCase()} ({libres})
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <div className="pista">En automático la simulación clasifica y asigna sola. Cambia a Manual para jugar.</div>
      )}
    </div>
  )
}
