import type { EstadoPlanta } from '../api/tipos'

interface PropsHud {
  planta: EstadoPlanta | null
  error: string | null
  iniciar: () => void
  pausar: () => void
  paso: () => void
  reiniciar: () => void
}

/**
 * Barra superior: tick, semilla y controles de la simulación.
 * Si el backend no responde, muestra el error debajo.
 */
export function Hud({ planta, error, iniciar, pausar, paso, reiniciar }: PropsHud) {
  return (
    <div className="hud-superior">
      <div className="panel barra">
        <strong className="titulo">Simulador de Planta</strong>
        {planta ? (
          <>
            {planta.enEjecucion ? (
              <button onClick={pausar}>⏸ Pausar</button>
            ) : (
              <button onClick={iniciar}>▶ Iniciar</button>
            )}
            <button onClick={paso}>Paso</button>
            <button onClick={reiniciar}>Reiniciar</button>
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
      {error && <div className="panel error">{error}</div>}
    </div>
  )
}
