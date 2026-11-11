import type { ColaCircular, Sensor } from '../api/tipos'
import { COLOR_CELDA_VACIA, COLOR_FINAL, COLOR_FRENTE, colorLectura } from '../colores'

interface PropsColaCircularHud {
  cola: ColaCircular
  sensores: Sensor[]
  indiceSensor: number
  seleccionarSensor: (indice: number) => void
}

/** Tamaño del dibujo (es cuadrado). */
const LADO = 260
const CENTRO = LADO / 2
const RADIO = 92
const RADIO_CELDA = 19
/** Radio de los índices y de las marcas F y L, por fuera de las celdas. */
const RADIO_INDICE = 121

/** Punto del anillo para la celda `i`: la 0 arriba y las siguientes como las agujas del reloj. */
function punto(i: number, capacidad: number, radio: number): [number, number] {
  const angulo = (2 * Math.PI * i) / capacidad
  return [CENTRO + radio * Math.sin(angulo), CENTRO - radio * Math.cos(angulo)]
}

/**
 * Las cifras exactas de la cola circular de la máquina seleccionada: cada celda con su índice físico y el
 * valor del sensor elegido, los punteros `frente` (F) y `final` (L), el tamaño y las sobrescrituras.
 *
 * Es el mismo anillo del piso, en el mismo orden, pero con los números. Pasar el mouse por una celda
 * muestra el tick de su lectura.
 */
export function ColaCircularHud({ cola, sensores, indiceSensor, seleccionarSensor }: PropsColaCircularHud) {
  const sensor = sensores[indiceSensor]
  const llena = cola.tamano === cola.capacidad
  const [xF, yF] = punto(cola.indiceFrente, cola.capacidad, RADIO_INDICE)
  const [xL, yL] = punto(cola.indiceFinal, cola.capacidad, RADIO_INDICE)

  return (
    <div className="cola-circular">
      <div className="fila">
        <span className="suave">Sensor</span>
        <select value={indiceSensor} onChange={(e) => seleccionarSensor(Number(e.target.value))}>
          {sensores.map((s, k) => (
            <option key={s.nombre} value={k}>
              {s.nombre} ({s.unidad})
            </option>
          ))}
        </select>
      </div>

      <svg viewBox={`0 0 ${LADO} ${LADO}`} className="anillo">
        {cola.celdas.map((lectura, i) => {
          const [x, y] = punto(i, cola.capacidad, RADIO)
          const [xi, yi] = punto(i, cola.capacidad, RADIO_INDICE)
          const marcado = i === cola.indiceFrente || i === cola.indiceFinal
          const valor = lectura?.valores[indiceSensor]
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={RADIO_CELDA}
                fill={valor === undefined ? COLOR_CELDA_VACIA : colorLectura(valor, sensor)}
                stroke={valor === undefined ? '#566173' : '#11161d'}
                strokeDasharray={valor === undefined ? '3 3' : undefined}
              >
                <title>{lectura ? `Celda ${i}: tick ${lectura.tick}` : `Celda ${i}: vacía`}</title>
              </circle>
              <text x={x} y={y + 3.5} className="valor-celda">
                {valor === undefined ? '' : valor.toFixed(1)}
              </text>
              {!marcado && (
                <text x={xi} y={yi + 4} className="indice-celda">
                  {i}
                </text>
              )}
            </g>
          )
        })}
        {/* Punteros: con la cola llena caen en la misma celda, así que se separan un poco. */}
        <text x={xF - (llena ? 9 : 0)} y={yF + 4} className="puntero" fill={COLOR_FRENTE}>
          F{llena ? '' : cola.indiceFrente}
        </text>
        <text x={xL + (llena ? 9 : 0)} y={yL + 4} className="puntero" fill={COLOR_FINAL}>
          L{llena ? '' : cola.indiceFinal}
        </text>
        <text x={CENTRO} y={CENTRO - 6} className="centro">
          {cola.tamano} / {cola.capacidad}
        </text>
        <text x={CENTRO} y={CENTRO + 12} className="centro suave">
          sobrescrituras: {cola.sobrescrituras}
        </text>
      </svg>

      <dl className="datos">
        <dt style={{ color: COLOR_FRENTE }}>frente (F)</dt>
        <dd>{cola.indiceFrente} · la lectura más antigua</dd>
        <dt style={{ color: COLOR_FINAL }}>final (L)</dt>
        <dd>{cola.indiceFinal} · donde se escribe la próxima</dd>
      </dl>
      {llena && <div className="nota">Llena: frente y final coinciden; la próxima lectura sobrescribe el frente.</div>}
    </div>
  )
}
