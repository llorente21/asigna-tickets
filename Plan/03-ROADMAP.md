# Roadmap — cambios futuros / pendientes

Lista viva de mejoras propuestas o pendientes, no comprometidas a una fecha. Cuando se
empieza a trabajar en algo de aquí, mover el ítem a "En progreso"; cuando se termina,
moverlo (con fecha) a `04-MILESTONES.md` y borrarlo de aquí o marcarlo hecho.

## En progreso
- **Fase 6 — Dashboard ampliado: código listo, falta que Jose lo pruebe.** 3
  KPIs nuevos (tasa de reapertura, tiempo promedio de primera respuesta,
  calificación promedio) y un gráfico nuevo (carga de tickets abiertos por
  responsable). No necesita reglas de Firestore nuevas. Ver
  `06-BRIEF-Y-PROMPT-REVISION-2026-09.md` y `02-FUNCIONALIDAD.md` ("Dashboard
  ampliado"). **Esta es la última fase del plan de ajustes 2026-09** — al
  confirmarse, sigue el rediseño visual completo de la app (decisión de Jose,
  2026-09-07: primero cerrar el roadmap funcional, después un solo pase de
  diseño con Claude Design sobre la app ya completa, para no construir los
  widgets del Dashboard dos veces).

## Completado (pendiente de revisar si vuelve a tocarse `firestore.rules`)
- **Fase 1 (Firebase Authentication), Fase 2 (rol Empleado ampliado), seguridad
  por fila de `tickets`/`notificaciones`, Fase 3 (auto-registro con aprobación
  de Locatario), Fase 4 (calificación del servicio) y Fase 5 (catálogo de
  Suplidores)** — en producción desde 2026-09-02/07, probadas por Jose. Ver
  `04-MILESTONES.md`.

## Pendiente — prioridad alta
- **Rediseño visual con Claude Design.** Tras confirmar la Fase 6: un pase de
  diseño enfocado en toda la app (no solo el Dashboard), sobre la app ya
  funcionalmente completa. Sin alcance detallado todavía — se define cuando
  arranque.

## Pendiente — prioridad media
- **Estados y Prioridades como catálogos editables.** Hoy son de solo lectura en el
  panel de escritorio; Áreas y Empresas ya son editables. Llevarlos al mismo patrón.
- **Alinear las reglas de Firestore al flujo de 3 estatus.** La regla `allow update`
  de `tickets` todavía permite los 5 estatus antiguos (`en_revision`, `resuelto`)
  aunque la UI ya no los usa — no es un bug activo pero conviene limpiarlo cuando se
  vuelva a tocar `firestore.rules`.

## Pendiente — prioridad baja / exploratorio
- **Explorar direcciones visuales** producidas en `design/` (`asigna-tres-direcciones.html`
  — 1a Luz de día, 1b Vecinos, 1c Panel claro) y decidir si se adopta alguna o se
  toman elementos sueltos. Ver `design/README.md` para cómo verlas/editarlas.

## Ideas sin priorizar
- (agregar aquí ideas sueltas que surjan en conversación, para no perderlas, antes de
  decidir si entran al roadmap formal)

---
Cuando el usuario pida algo nuevo que no se vaya a implementar de inmediato, registrarlo
aquí en vez de dejarlo solo en el historial de chat.
