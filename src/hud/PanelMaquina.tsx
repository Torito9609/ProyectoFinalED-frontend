import { useState } from 'react'
import type { Magnitud, Maquina } from '../api/tipos'
import { COLOR_ESTADO, NOMBRE_ESTADO, NOMBRE_TIPO_FALLO, colorLectura } from '../colores'
import { ColaCircularHud } from './ColaCircularHud'

interface PropsPanelMaquina {
  maquina: Maquina
  /** La compañía está en quiebra: no acepta acciones. */
  bloqueada: boolean
  cerrar: () => void
  /** Sensor que se dibuja en la cola circular. */
  sensorVista: number
  seleccionarSensor: (indice: number) => void
  inyectarFallo: (indiceSensor: number, magnitud: Magnitud) => void
  pararOArrancar: () => void
  cambiarCarga: (carga: number) => void
}

const MAGNITUDES: Magnitud[] = ['LEVE', 'MODERADA', 'SEVERA']

/**
 * Detalle de la máquina seleccionada y las acciones del operador sobre ella.
 *
 * Cada botón se deshabilita en los mismos casos en que el backend respondería 409, para que el usuario
 * vea por qué no puede usarlo; aun así, la regla la aplica el backend, no este panel.
 *
 * Se monta con una `key` por máquina, así el deslizador de carga y el formulario de fallo empiezan de
 * nuevo al cambiar de máquina.
 */
export function PanelMaquina(props: PropsPanelMaquina) {
  const { maquina, bloqueada } = props
  const [carga, setCarga] = useState(maquina.carga)
  const [indiceSensor, setIndiceSensor] = useState(0)
  const [magnitud, setMagnitud] = useState<Magnitud>('SEVERA')

  const lecturas = maquina.lecturas
  // La lectura más reciente está justo antes de `final` en el arreglo circular.
  const ultima =
    lecturas.tamano > 0
      ? lecturas.celdas[(lecturas.indiceFinal - 1 + lecturas.capacidad) % lecturas.capacidad]
      : null

  const puedeParar = maquina.estado === 'OPERANDO' || maquina.estado === 'PARADA_MANUAL'
  const tieneFallo = maquina.tieneAnomalia || maquina.alarmaActiva

  return (
    <div className="panel panel-maquina">
      <div className="encabezado">
        <span>
          <span className="indice">[{maquina.indice}]</span> {maquina.etiqueta}
        </span>
        <button className="cerrar" onClick={props.cerrar} title="Cerrar">
          ✕
        </button>
      </div>
      <div className="suave">{maquina.tipoDescripcion}</div>
      <div className="estado" style={{ color: COLOR_ESTADO[maquina.estado] }}>
        {NOMBRE_ESTADO[maquina.estado]}
      </div>

      <dl className="datos">
        <dt>Carga</dt>
        <dd>{maquina.carga} %</dd>
        <dt>Preventivo</dt>
        <dd>
          {maquina.ticksDesdeMantenimiento} / {maquina.intervaloPreventivo} ticks
        </dd>
        <dt>Puntaje de fallos</dt>
        <dd>{maquina.puntajeFallos}</dd>
        <dt>Overhauls</dt>
        <dd>{maquina.numeroOverhauls}</dd>
        <dt>Recomendación</dt>
        <dd>{maquina.recomendacion === 'NINGUNA' ? '—' : maquina.recomendacion}</dd>
      </dl>

      <div className="seccion">Sensores (última lectura)</div>
      <table className="sensores">
        <tbody>
          {maquina.sensores.map((sensor, k) => {
            const valor = ultima?.valores[k]
            return (
              <tr key={sensor.nombre}>
                <td>{sensor.nombre}</td>
                <td className="valor" style={{ color: valor === undefined ? undefined : colorLectura(valor, sensor) }}>
                  {valor === undefined ? '—' : `${valor.toFixed(1)} ${sensor.unidad}`}
                </td>
                <td className="suave">{NOMBRE_TIPO_FALLO[sensor.tipoFallo]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="seccion">Cola circular de lecturas</div>
      <ColaCircularHud
        cola={maquina.lecturas}
        sensores={maquina.sensores}
        indiceSensor={props.sensorVista}
        seleccionarSensor={props.seleccionarSensor}
      />

      <div className="seccion">Carga</div>
      <div className="fila">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={carga}
          onChange={(e) => setCarga(Number(e.target.value))}
        />
        <span className="valor">{carga} %</span>
        <button disabled={bloqueada || carga === maquina.carga} onClick={() => props.cambiarCarga(carga)}>
          Aplicar
        </button>
      </div>

      <div className="fila">
        <button disabled={bloqueada || !puedeParar} onClick={props.pararOArrancar}>
          {maquina.estado === 'PARADA_MANUAL' ? 'Arrancar' : 'Parar'}
        </button>
      </div>

      <div className="seccion">Inyectar fallo</div>
      <div className="fila">
        <select value={indiceSensor} onChange={(e) => setIndiceSensor(Number(e.target.value))}>
          {maquina.sensores.map((sensor, k) => (
            <option key={sensor.nombre} value={k}>
              {sensor.nombre}
            </option>
          ))}
        </select>
        <select value={magnitud} onChange={(e) => setMagnitud(e.target.value as Magnitud)}>
          {MAGNITUDES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button
          disabled={bloqueada || tieneFallo}
          title={tieneFallo ? 'La máquina ya tiene un fallo activo' : undefined}
          onClick={() => props.inyectarFallo(indiceSensor, magnitud)}
        >
          Inyectar
        </button>
      </div>
    </div>
  )
}
