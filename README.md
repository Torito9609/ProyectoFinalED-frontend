# Simulador de Monitoreo y Mantenimiento de Planta — Frontend

Proyecto del curso **Estructuras de Datos** — Universidad Nacional de Colombia.
Equipo: **Cristian Robayo** y **Kevin Toro**.

Este repositorio es la **vista** del simulador: un diorama isométrico low-poly con cámara fija donde cada
estructura de datos es un objeto del mundo que se comporta como su tipo abstracto. Toda la lógica y las
estructuras viven en el backend (Spring Boot), en el repositorio
[ProyectoFinalED](https://github.com/Torito9609/ProyectoFinalED); este frontend solo consulta su API REST.

## Stack

- React 19 + TypeScript, empaquetado con Vite.
- [React Three Fiber](https://r3f.docs.pmnd.rs/) (Three.js para React) y drei para la escena 3D.

## Requisitos

- Node.js 22 o superior.
- El backend corriendo en `http://localhost:8080` (ver `docs/API.md` en el repositorio del backend).

## Ejecutar

```bash
npm install
npm run dev        # abre http://localhost:5173
```

Otros comandos:

```bash
npm run build      # compila TypeScript y genera dist/
npm run lint       # revisa el código con oxlint
```
