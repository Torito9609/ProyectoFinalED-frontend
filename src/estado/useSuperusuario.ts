import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/cliente'
import type { Ranking, ResumenCompania, TipoMaquinaCatalogo } from '../api/tipos'

/** Cada cuánto se piden los datos del dashboard (ms). */
const INTERVALO_SONDEO_MS = 1000

/** Filtro del ranking: de qué compañía (o global) y si solo las candidatas a overhaul. */
export interface FiltroRanking {
  /** `null` es el ranking global. */
  idCompania: number | null
  soloCandidatas: boolean
}

/**
 * Datos de la vista del superusuario: los totales de cada compañía, el ranking de fallos y el catálogo de
 * tipos de máquina. Sondea solo mientras el dashboard está montado, con `setTimeout` encadenado como el
 * sondeo de la planta.
 *
 * "Solo candidatas" pide el ranking con `puntajeMinimo = umbralOverhaul`: es la consulta por rango del
 * árbol rojo-negro del backend, que se detiene en la primera máquina por debajo del umbral.
 */
export function useSuperusuario(filtro: FiltroRanking) {
  const [companias, setCompanias] = useState<ResumenCompania[]>([])
  const [ranking, setRanking] = useState<Ranking | null>(null)
  const [catalogo, setCatalogo] = useState<TipoMaquinaCatalogo[]>([])

  const { idCompania, soloCandidatas } = filtro
  // El umbral llega con el primer ranking; antes de eso no se filtra.
  const umbral = ranking?.umbralOverhaul

  const refrescar = useCallback(async () => {
    const minimo = soloCandidatas ? umbral : undefined
    const [lista, rank] = await Promise.all([
      api.listarCompanias(),
      api.obtenerRanking(idCompania ?? undefined, minimo),
    ])
    setCompanias(lista)
    setRanking(rank)
  }, [idCompania, soloCandidatas, umbral])

  useEffect(() => {
    let activo = true
    let temporizador: number | undefined

    async function ciclo() {
      try {
        await refrescar()
      } catch {
        // El error de conexión ya lo muestra el sondeo de la planta; aquí solo se reintenta.
      }
      if (activo) temporizador = window.setTimeout(ciclo, INTERVALO_SONDEO_MS)
    }

    ciclo()
    return () => {
      activo = false
      window.clearTimeout(temporizador)
    }
  }, [refrescar])

  // El catálogo no cambia: se pide una vez.
  useEffect(() => {
    api
      .listarTiposMaquina()
      .then(setCatalogo)
      .catch(() => {
        // Sin catálogo, el formulario de crear máquina queda deshabilitado.
      })
  }, [])

  return { companias, ranking, catalogo, refrescar }
}
