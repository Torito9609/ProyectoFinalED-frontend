import { createContext } from 'react'
import type { RefObject } from 'react'

/**
 * Contenedor fijo donde se agregan todas las etiquetas HTML de la escena. Lo crea `Escena`.
 *
 * Sin él, cada `Html` de drei elige su contenedor al montarse y lo cambia cuando React Three Fiber conecta
 * sus eventos; al cambiarlo rehace su raíz de React en medio de un render, y en esa carrera la primera
 * etiqueta quedaba vacía.
 */
export const CapaEtiquetas = createContext<RefObject<HTMLDivElement | null> | null>(null)
