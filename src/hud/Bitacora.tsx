/** Cuántas líneas de la bitácora se muestran. */
const LINEAS_VISIBLES = 8

/**
 * Últimas líneas de la bitácora. El backend las entrega de la más antigua a la más reciente,
 * así que la más reciente queda abajo.
 */
export function Bitacora({ lineas }: { lineas: string[] }) {
  const ultimas = lineas.slice(-LINEAS_VISIBLES)
  return (
    <div className="panel bitacora">
      <div className="encabezado">Bitácora</div>
      {ultimas.length === 0 ? (
        <div className="vacio">Sin eventos todavía</div>
      ) : (
        ultimas.map((linea, i) => <div key={lineas.length - ultimas.length + i}>{linea}</div>)
      )}
    </div>
  )
}
