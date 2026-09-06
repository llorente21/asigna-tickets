# Roadmap — cambios futuros / pendientes

Lista viva de mejoras propuestas o pendientes, no comprometidas a una fecha. Cuando se
empieza a trabajar en algo de aquí, mover el ítem a "En progreso"; cuando se termina,
moverlo (con fecha) a `04-MILESTONES.md` y borrarlo de aquí o marcarlo hecho.

## En progreso
- **Seguridad por fila (`tickets`/`notificaciones`): código listo, falta el paso
  manual de Jose.** `index.html` ya usa `:runQuery` filtrado por `empleado_email`/
  `para` para el rol Locatario en vez de listar la colección completa. **Falta:**
  Jose confirme que las 3 cuentas siguen funcionando bien con este código (tickets,
  notificaciones, comentarios, reabrir) y luego pegue las reglas nuevas de Firestore
  (README.md sección 3.2) en la consola. Ver `06-BRIEF-Y-PROMPT-REVISION-2026-09.md`.

## Completado (pendiente de revisar si vuelve a tocarse `firestore.rules`)
- **Fase 1 (Firebase Authentication) y Fase 2 (rol Empleado ampliado)** — en
  producción desde 2026-09-02, probadas con las 3 cuentas de rol. Ver
  `04-MILESTONES.md`.

## Pendiente — prioridad alta
- **Plan de ajustes 2026-09 — fases restantes.** Detalle completo en
  [`06-BRIEF-Y-PROMPT-REVISION-2026-09.md`](06-BRIEF-Y-PROMPT-REVISION-2026-09.md):
  3. **Auto-registro con aprobación** para Locatario.
  4. **Calificación del servicio al cerrar ticket** (1-5 estrellas) — independiente,
     bajo riesgo, se puede hacer en paralelo.
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
