# Frontend del Simulador de Planta

Vista web del proyecto del curso **Estructuras de Datos** (UNAL), equipo Cristian Robayo y Kevin Toro.
El diseño completo y las decisiones del proyecto están en el `CLAUDE.md` del **backend**
(`../untitled/CLAUDE.md`, repositorio `Torito9609/ProyectoFinalED`), secciones 9 y 16. Este archivo solo
recoge lo propio del frontend.

## Qué evalúa el profesor
Que las estructuras de datos queden muy claras (por qué, cómo se usan, cómo están implementadas). La vista
**suma mucho**: por eso el frontend es un juego con cámara fija. El framework no suma ni resta.

## Stack
- React 19 + TypeScript + Vite, React Three Fiber + drei (`three`).
- Sin librerías de estado, de estilos ni de pruebas por ahora. **No agregar dependencias sin proponerlo.**

## Reglas
1. **Solo `src/api/cliente.ts` conoce URLs y rutas.** El resto de la app llama a sus funciones. Así el
   cambio de rutas del commit 19 del backend (`/api/planta` → `/api/companias/{id}`) toca un solo archivo.
2. **Los tipos de `src/api/tipos.ts` copian `docs/API.md` del backend.** Si el contrato cambia, se cambia
   allá primero y luego aquí.
3. **El frontend no tiene lógica de simulación.** Solo dibuja el estado que devuelve la API y dispara
   acciones. Nunca decide qué elemento sale de una estructura: eso lo decide el backend.
4. **Sondeo:** `GET` del estado cada 500 ms, siempre (también en pausa), con `setTimeout` encadenado para
   que nunca haya dos peticiones a la vez. Sin WebSockets.
5. **Cámara fija** isométrica (sin `OrbitControls`).
6. **No dibujar estado interno que la estructura no expone** (por ejemplo, la capacidad de un `ArrayList`).
7. **HUD en HTML sobre el canvas**, con las cifras exactas (índices, `frente` y `final`, ticks restantes).
   El mundo 3D muestra el comportamiento; el HUD, los números.

## Cada estructura es un objeto del mundo
| Estructura (backend) | Objeto en la escena |
|---|---|
| Inventario (`ArrayList`) | Las máquinas en el piso, en orden de índice |
| Cola circular de lecturas | Tablero en anillo junto a cada máquina, con `frente` y `final` |
| Cola de eventos (FIFO) | Banda transportadora |
| Cola con prioridad P1–P4 | Tablero de 4 carriles (rojo, naranja, amarillo, azul) |
| Cola de técnicos (FIFO) | Banca donde hacen fila; caminan a la máquina |
| Pila de deshacer | Montón de carpetas, la cima arriba |

## Convenciones
- Identificadores en español, sin tildes ni ñ (`usePlanta`, `MaquinaModelo`, `tamano`). Comentarios en
  español con tildes. Componentes en PascalCase, un componente por archivo.
- Colores de estados y prioridades en un solo lugar (`src/colores.ts`).

## Forma de trabajo (igual que el backend)
- Commits pequeños. Antes de cada uno: `npm run build` y `npm run lint`, resumir el diff, pedir permiso y
  esperar la revisión del equipo. **No hacer `commit` ni `push` sin permiso.**
- Mantenerlo simple: el equipo debe poder explicar todo el código en clase.
- Los commits hechos con Claude Code llevan la línea `Co-Authored-By` (registro del uso de IA).

## Plan
**Hito 1:** (1) proyecto Vite con React Three Fiber → (2) tipos y cliente de la API → (3) sondeo y HUD de
control con bitácora → (4) escena isométrica con las máquinas.
