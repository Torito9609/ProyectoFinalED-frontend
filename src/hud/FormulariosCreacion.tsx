import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Ranking, ResumenCompania, TipoMaquina, TipoMaquinaCatalogo } from '../api/tipos'

interface PropsFormulariosCreacion {
  companias: ResumenCompania[]
  catalogo: TipoMaquinaCatalogo[]
  /** El ranking global trae las etiquetas de todas las máquinas: sirve para sugerir la siguiente. */
  ranking: Ranking | null
  crearCompania: (nombre: string) => Promise<void>
  crearMaquina: (idCompania: number, tipo: TipoMaquina, etiqueta: string) => Promise<void>
}

/** Convierte un error en el texto que se muestra junto al formulario. */
function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Sugiere la etiqueta siguiente de un tipo en una compañía: el prefijo y el primer número libre
 * (`TORNO-02`). Es solo una ayuda: si el ranking está filtrado puede sugerir una que ya existe, y quien
 * valida que no se repita es el conjunto del backend (responde 409).
 */
function sugerirEtiqueta(prefijo: string, idCompania: number, ranking: Ranking | null): string {
  const usados = new Set(
    (ranking?.maquinas ?? []).filter((m) => m.idCompania === idCompania).map((m) => m.etiqueta),
  )
  let numero = 1
  while (usados.has(`${prefijo}-${String(numero).padStart(2, '0')}`)) numero++
  return `${prefijo}-${String(numero).padStart(2, '0')}`
}

/**
 * Formularios para crear una compañía y una máquina. El nombre de la compañía debe ser único en la
 * organización, y la etiqueta, única dentro de su compañía: lo garantiza un conjunto (`TreeSet`) en el
 * backend, que responde 409 si se repite. Aquí solo se muestra el mensaje.
 */
export function FormulariosCreacion(props: PropsFormulariosCreacion) {
  const { companias, catalogo, ranking } = props
  const [nombre, setNombre] = useState('')
  const [mensajeCompania, setMensajeCompania] = useState<string | null>(null)

  const [idCompania, setIdCompania] = useState(0)
  const [tipo, setTipo] = useState<TipoMaquina>('PRENSA')
  const [etiqueta, setEtiqueta] = useState('')
  const [mensajeMaquina, setMensajeMaquina] = useState<string | null>(null)

  const prefijo = catalogo.find((t) => t.tipo === tipo)?.prefijo ?? tipo
  const sugerida = sugerirEtiqueta(prefijo, idCompania, ranking)

  async function enviarCompania(e: FormEvent) {
    e.preventDefault()
    try {
      await props.crearCompania(nombre)
      setMensajeCompania(`Compañía "${nombre.trim()}" creada`)
      setNombre('')
    } catch (error) {
      setMensajeCompania(mensajeDe(error))
    }
  }

  async function enviarMaquina(e: FormEvent) {
    e.preventDefault()
    const final = etiqueta.trim() === '' ? sugerida : etiqueta
    try {
      await props.crearMaquina(idCompania, tipo, final)
      setMensajeMaquina(`Máquina ${final.trim().toUpperCase()} creada`)
      setEtiqueta('')
    } catch (error) {
      setMensajeMaquina(mensajeDe(error))
    }
  }

  return (
    <div className="panel formularios">
      <form onSubmit={enviarCompania}>
        <div className="seccion">Crear compañía</div>
        <div className="fila">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre, p. ej. Planta Oriente" />
          <button type="submit" disabled={nombre.trim() === ''}>
            Crear
          </button>
        </div>
        {mensajeCompania && <div className="mensaje">{mensajeCompania}</div>}
      </form>

      <form onSubmit={enviarMaquina}>
        <div className="seccion">Crear máquina</div>
        <div className="fila">
          <select value={idCompania} onChange={(e) => setIdCompania(Number(e.target.value))}>
            {companias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaquina)}>
            {catalogo.map((t) => (
              <option key={t.tipo} value={t.tipo}>
                {t.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="fila">
          <input value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} placeholder={sugerida} />
          <button type="submit" disabled={catalogo.length === 0}>
            Crear
          </button>
        </div>
        {mensajeMaquina && <div className="mensaje">{mensajeMaquina}</div>}
      </form>
    </div>
  )
}
