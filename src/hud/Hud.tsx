import type { EstadoPlanta, ResumenCompania } from '../api/tipos'

interface PropsHud {
  planta: EstadoPlanta | null
  companias: ResumenCompania[]
  idCompania: number
  seleccionarCompania: (id: number) => void
  error: string | null
  iniciar: () => void
  pausar: () => void
  paso: () => void
  reiniciar: () => void
}

/**
 * Barra superior: controles de la simulación, tick y semilla, y debajo una pestaña por compañía.
 * Si el backend no responde, muestra el error al final.
 */
export function Hud(props: PropsHud) {
  const { planta, companias, idCompania, seleccionarCompania, error } = props

  return (
    <div className="hud-superior">
      <div className="panel barra">
        <strong className="titulo">Simulador de Planta</strong>
        {planta ? (
          <>
            {planta.enEjecucion ? (
              <button onClick={props.pausar}>⏸ Pausar</button>
            ) : (
              <button onClick={props.iniciar}>▶ Iniciar</button>
            )}
            <button onClick={props.paso}>Paso</button>
            <button onClick={props.reiniciar}>Reiniciar</button>
            <span className="dato">
              Tick <b>{planta.tick}</b>
            </span>
            <span className="dato">
              Semilla <b>{planta.semilla}</b>
            </span>
          </>
        ) : (
          <span className="dato">Conectando…</span>
        )}
      </div>
      {companias.length > 0 && (
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
    </div>
  )
}
