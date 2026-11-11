import type { EstadoPlanta, EstadoSimulacion, Modo, ResumenCompania } from '../api/tipos'
import { NOMBRE_MODO } from '../colores'

interface PropsHud {
  planta: EstadoPlanta | null
  simulacion: EstadoSimulacion | null
  companias: ResumenCompania[]
  idCompania: number
  seleccionarCompania: (id: number) => void
  error: string | null
  aviso: string | null
  iniciar: () => void
  pausar: () => void
  paso: () => void
  reiniciar: () => void
  deshacer: () => void
  cambiarModo: (modo: Modo) => void
  verResumen: () => void
  vista: Vista
  cambiarVista: (vista: Vista) => void
}

/** Las dos vistas: el diorama de una compañía o el dashboard del superusuario. */
export type Vista = 'COMPANIA' | 'SUPERUSUARIO'

const MODOS: Modo[] = ['AUTOMATICO', 'MANUAL']

/**
 * Barra superior: controles de la simulación, el interruptor de modo, tick y semilla, deshacer y el
 * resumen de la partida, y debajo una pestaña por compañía. Si el backend no responde, muestra el error al final; si una acción se rechazó, su aviso.
 */
export function Hud(props: PropsHud) {
  const { planta, simulacion, companias, idCompania, seleccionarCompania, error, aviso } = props

  return (
    <div className="hud-superior">
      <div className="panel barra">
        <strong className="titulo">Simulador de Planta</strong>
        <div className="interruptor">
          <button className={props.vista === 'COMPANIA' ? 'activa' : ''} onClick={() => props.cambiarVista('COMPANIA')}>
            Compañía
          </button>
          <button
            className={props.vista === 'SUPERUSUARIO' ? 'activa' : ''}
            onClick={() => props.cambiarVista('SUPERUSUARIO')}
          >
            Superusuario
          </button>
        </div>
        {planta ? (
          <>
            {planta.enEjecucion ? (
              <button onClick={props.pausar}>⏸ Pausar</button>
            ) : (
              <button onClick={props.iniciar}>▶ Iniciar</button>
            )}
            <button onClick={props.paso}>Paso</button>
            <button onClick={props.reiniciar}>Reiniciar</button>
            <button
              disabled={planta.pilaDeshacer.length === 0}
              title={planta.pilaDeshacer[0] ? `Deshacer: ${planta.pilaDeshacer[0]}` : 'No hay acciones para deshacer'}
              onClick={props.deshacer}
            >
              ↶ Deshacer ({planta.pilaDeshacer.length})
            </button>
            <button onClick={props.verResumen}>Resumen</button>
            <div className="interruptor" title="El tiempo sigue corriendo al cambiar de modo">
              {MODOS.map((modo) => (
                <button
                  key={modo}
                  className={planta.modo === modo ? 'activa' : ''}
                  onClick={() => planta.modo !== modo && props.cambiarModo(modo)}
                >
                  {NOMBRE_MODO[modo]}
                </button>
              ))}
            </div>
            <span className="dato">
              Tick <b>{planta.tick}</b>
              {simulacion && ` / ${simulacion.duracionPartida}`}
            </span>
            <span className="dato">
              Semilla <b>{planta.semilla}</b>
            </span>
          </>
        ) : (
          <span className="dato">Conectando…</span>
        )}
      </div>
      {props.vista === 'COMPANIA' && companias.length > 0 && (
        <div className="panel pestanas">
          {companias.map((compania) => (
            <button
              key={compania.id}
              className={compania.id === idCompania ? 'activa' : ''}
              onClick={() => seleccionarCompania(compania.id)}
            >
              {compania.nombre}
            </button>
          ))}
        </div>
      )}
      {error && <div className="panel error">{error}</div>}
      {aviso && <div className="panel aviso">{aviso}</div>}
    </div>
  )
}
