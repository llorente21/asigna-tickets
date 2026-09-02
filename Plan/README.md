# Plan/ — Carpeta de planificación de ASIGNA

Esta carpeta es la **fuente de verdad de referencia** para cualquier agente (Claude
Code, agente de diseño, o cualquier otro) que trabaje en este repositorio. No es
documentación de usuario final (para eso está `README.md` en la raíz) — es la memoria
de trabajo del equipo de agentes: arquitectura, funcionalidad, estándares, decisiones,
progreso y lecciones aprendidas.

## Cómo usarla (para agentes)

**Al empezar cualquier tarea en este repo:**
1. Lee `04-MILESTONES.md` primero — qué se ha hecho hasta ahora y qué quedó pendiente
   de la última sesión.
2. Lee `02-FUNCIONALIDAD.md` y `01-ARQUITECTURA.md` si la tarea toca lógica de negocio
   o estructura técnica.
3. Revisa `03-ROADMAP.md` para ver si la tarea ya estaba anticipada y si hay contexto
   o decisiones previas relevantes.
4. Sigue las convenciones de `05-ESTANDARES.md`.

**Al terminar una tarea que valga la pena recordar:**
- Agrega una entrada en `04-MILESTONES.md` (qué se hizo, por qué, fecha).
- Si aprendiste algo que evitaría un error futuro (un bug sutil, una limitación de
  Firestore/GitHub Pages/PWA, una decisión de diseño que se revirtió), agrégalo a la
  sección "Lecciones aprendidas" de `05-ESTANDARES.md`.
- Si el cambio abre o cierra algo del roadmap, actualiza `03-ROADMAP.md`.
- Si el cambio altera la arquitectura o el modelo de datos, actualiza
  `01-ARQUITECTURA.md` / `02-FUNCIONALIDAD.md`.

Mantener estos documentos actualizados es parte de terminar la tarea, no un paso
opcional aparte.

## Índice

- [`01-ARQUITECTURA.md`](01-ARQUITECTURA.md) — stack técnico, estructura de archivos,
  Firebase/Firestore, PWA, cómo probar localmente.
- [`02-FUNCIONALIDAD.md`](02-FUNCIONALIDAD.md) — roles, flujo de negocio, secciones de
  la app, modelo de datos por colección.
- [`03-ROADMAP.md`](03-ROADMAP.md) — cambios futuros propuestos o pendientes, por
  prioridad.
- [`04-MILESTONES.md`](04-MILESTONES.md) — historial de hitos y progreso, entrada más
  reciente arriba.
- [`05-ESTANDARES.md`](05-ESTANDARES.md) — convenciones de código, skills relevantes,
  checklist antes de dar un cambio por bueno, lecciones aprendidas.

## Para el agente de diseño

Esta carpeta también aplica a trabajo de diseño (mockups en `design/`, direcciones
visuales, etc.). Antes de proponer una dirección visual nueva, lee `02-FUNCIONALIDAD.md`
(para no romper flujos ni roles existentes) y `05-ESTANDARES.md` (tokens de marca,
convenciones visuales ya establecidas — color de acento, logo, etc.). Cualquier
decisión de diseño adoptada debe quedar registrada en `04-MILESTONES.md`.
