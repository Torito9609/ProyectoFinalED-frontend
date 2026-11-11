/** Formatos de números para mostrar. */

const DINERO = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** Dinero en enteros, con separador de miles: `$ 1.234.567`. */
export function dinero(valor: number): string {
  return `$ ${DINERO.format(valor)}`
}

/** Fracción de 0 a 1 como porcentaje: `78 %`. */
export function porcentaje(fraccion: number): string {
  return `${Math.round(fraccion * 100)} %`
}
