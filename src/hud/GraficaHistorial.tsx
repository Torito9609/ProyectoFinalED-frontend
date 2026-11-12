import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { ResumenCompania } from '../api/tipos'
import { COLOR_PRIORIDAD } from '../colores'
import { useHistorial } from '../estado/useHistorial'
import type { Ventana } from '../estado/useHistorial'
import { dinero } from '../formato'

interface PropsGraficaHistorial {
  companias: ResumenCompania[]
}

/** Ancho y alto del sistema de coordenadas de cada gráfica; el SVG se estira al ancho del panel. */
const ANCHO = 1000
const ALTO = 120
/** Espacio libre sobre el pico, para que su línea no quede pegada al borde. */
const HOLGURA = 1.15

const COLOR_FALLOS = COLOR_PRIORIDAD.P2
const COLOR_COSTO = '#3b8eea'

interface PropsSerie {
  titulo: string
  valores: number[]
  /** Tick del primer valor: `valores[i]` es el del tick `desde + i`. */
  desde: number
  total: number
  pico: number
  color: string
  formato: (valor: number) => string
}

/**
 * Una serie como área escalonada: cada tick es un escalón del ancho que le toca. La línea punteada marca
 * el pico de la ventana, el máximo que da el árbol de segmentos. Al pasar el mouse se ve el valor de cada
 * tick.
 */
function Serie({ titulo, valores, desde, total, pico, color, formato }: PropsSerie) {
  const [cursor, setCursor] = useState<number | null>(null)
  const n = valores.length
  const escala = Math.max(pico, 1) * HOLGURA
  const ancho = ANCHO / n
  const y = (valor: number) => ALTO - (valor / escala) * ALTO

  // Contorno escalonado: sube o baja al empezar cada tick y sigue horizontal hasta el siguiente.
  let camino = `M 0 ${ALTO}`
  valores.forEach((valor, i) => {
    camino += ` L ${i * ancho} ${y(valor)} L ${(i + 1) * ancho} ${y(valor)}`
  })
  camino += ` L ${ANCHO} ${ALTO} Z`

  function alMover(evento: MouseEvent<SVGSVGElement>) {
    const caja = evento.currentTarget.getBoundingClientRect()
    const i = Math.floor(((evento.clientX - caja.left) / caja.width) * n)
    setCursor(Math.min(n - 1, Math.max(0, i)))
  }

  return (
    <div className="serie">
      <div className="encabezado">
        <span style={{ color }}>{titulo}</span>
        <span className="cifras">
          {cursor !== null ? (
            <span>
              Tick {desde + cursor}: <b>{formato(valores[cursor])}</b>
            </span>
          ) : (
            <span className="suave">pasa el mouse para ver cada tick</span>
          )}
          <span>
            Total <b>{formato(total)}</b>
          </span>
          <span>
            Pico <b>{formato(pico)}</b>
          </span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        preserveAspectRatio="none"
        className="grafica"
        onMouseMove={alMover}
        onMouseLeave={() => setCursor(null)}
      >
        <path d={camino} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {pico > 0 && (
          <line
            x1={0}
            x2={ANCHO}
            y1={y(pico)}
            y2={y(pico)}
            className="linea-pico"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {cursor !== null && (
          <line
            x1={(cursor + 0.5) * ancho}
            x2={(cursor + 0.5) * ancho}
            y1={0}
            y2={ALTO}
            className="linea-cursor"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  )
}

/**
 * El historial de fallos y de costo por tick, con una ventana [a, b] que elige el usuario, global o de una
 * compañía.
 *
 * El **total** y el **pico** de la ventana los calcula el árbol de segmentos del backend: cada nodo guarda
 * la suma y el máximo de su rango, así que salen en O(log n) sin recorrer los ticks. El pico es lo que
 * justifica el árbol frente a las sumas prefijas, que solo darían el total. Las series por tick llegan
 * solo para dibujarlas.
 *
 * Mientras no se mueve la ventana, la gráfica muestra toda la partida y la sigue en vivo; "Toda la partida"
 * vuelve a ese modo.
 */
export function GraficaHistorial({ companias }: PropsGraficaHistorial) {
  const [idCompania, setIdCompania] = useState<number | null>(null)
  /** `null`: toda la partida, en vivo. */
  const [ventana, setVentana] = useState<Ventana | null>(null)
  const { historial, ultimoTick } = useHistorial(idCompania, ventana)

  const desde = ventana?.desde ?? 0
  const hasta = ventana ? Math.min(ventana.hasta, ultimoTick) : ultimoTick
  const sinDatos = ultimoTick < 0

  /** Mueve un extremo de la ventana sin que se crucen: `desde ≤ hasta`. */
  function mover(extremo: keyof Ventana, valor: number) {
    if (Number.isNaN(valor)) return
    const v = Math.min(ultimoTick, Math.max(0, Math.round(valor)))
    setVentana(extremo === 'desde' ? { desde: v, hasta: Math.max(v, hasta) } : { desde: Math.min(desde, v), hasta: v })
  }

  return (
    <div className="panel historial">
      <div className="encabezado">
        <span>Historial por ventana de ticks</span>
        <span className="suave">total y pico: árbol de segmentos (suma y máximo por nodo), O(log n)</span>
      </div>
      <div className="fila">
        <select value={idCompania ?? ''} onChange={(e) => setIdCompania(e.target.value === '' ? null : Number(e.target.value))}>
          <option value="">Global (todas las compañías)</option>
          {companias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button disabled={ventana === null} onClick={() => setVentana(null)}>
          Toda la partida (en vivo)
        </button>
      </div>
      {sinDatos ? (
        <div className="suave vacio">Aún no hay ticks registrados: inicia la simulación</div>
      ) : (
        <>
          <div className="ventana">
            {(['desde', 'hasta'] as const).map((extremo) => {
              const valor = extremo === 'desde' ? desde : hasta
              return (
                <label key={extremo}>
                  <span>{extremo === 'desde' ? 'Desde a' : 'Hasta b'}</span>
                  <input
                    type="range"
                    min={0}
                    max={ultimoTick}
                    value={valor}
                    onChange={(e) => mover(extremo, Number(e.target.value))}
                  />
                  <input
                    type="number"
                    min={0}
                    max={ultimoTick}
                    value={valor}
                    onChange={(e) => mover(extremo, Number(e.target.value))}
                  />
                </label>
              )
            })}
          </div>
          {historial && (
            <>
              <Serie
                titulo="Puntaje de fallos (P1 = 3, P2 = 2, P3 = 1)"
                valores={historial.fallosPorTick}
                desde={historial.desde}
                total={historial.totalFallos}
                pico={historial.picoFallos}
                color={COLOR_FALLOS}
                formato={String}
              />
              <Serie
                titulo="Costo (mano de obra, overhauls y reemplazos)"
                valores={historial.costoPorTick}
                desde={historial.desde}
                total={historial.totalCosto}
                pico={historial.picoCosto}
                color={COLOR_COSTO}
                formato={dinero}
              />
              <div className="eje suave">
                <span>tick {historial.desde}</span>
                <span>
                  {historial.alcance} · {historial.hasta - historial.desde + 1} ticks
                </span>
                <span>tick {historial.hasta}</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
