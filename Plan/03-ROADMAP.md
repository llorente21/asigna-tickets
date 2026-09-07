# Roadmap — cambios futuros / pendientes

Lista viva de mejoras propuestas o pendientes, no comprometidas a una fecha. Cuando se
empieza a trabajar en algo de aquí, mover el ítem a "En progreso"; cuando se termina,
moverlo (con fecha) a `04-MILESTONES.md` y borrarlo de aquí o marcarlo hecho.

## En progreso
- **Fase 4 — Calificación del servicio (1-5 estrellas) al cerrar ticket.** Recién
  empezada. Ver `06-BRIEF-Y-PROMPT-REVISION-2026-09.md`.

## Completado (pendiente de revisar si vuelve a tocarse `firestore.rules`)
- **Fase 1 (Firebase Authentication), Fase 2 (rol Empleado ampliado), seguridad
  por fila de `tickets`/`notificaciones` y Fase 3 (auto-registro con aprobación
  de Locatario)** — en producción desde 2026-09-02/07, probadas con las 3 cuentas
  de rol. Ver `04-MILESTONES.md`.

## Pendiente — prioridad alta
- **Plan de ajustes 2026-09 — fases restantes.** Detalle completo en
  [`06-BRIEF-Y-PROMPT-REVISION-2026-09.md`](06-BRIEF-Y-PROMPT-REVISION-2026-09.md):
  5. **"Suplidor" como catálogo** de responsables externos (sin cuenta propia) —
     independiente, bajo riesgo.
  6. **Dashboard ampliado** (carga por responsable, vencidos en tiempo real, tasa de
     reapertura, tiempo de primera respuesta, promedio de calificación) — al final,
     depende de datos que generan las fases 2 y 4.

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
