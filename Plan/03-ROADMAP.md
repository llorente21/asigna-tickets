# Roadmap — cambios futuros / pendientes

Lista viva de mejoras propuestas o pendientes, no comprometidas a una fecha. Cuando se
empieza a trabajar en algo de aquí, mover el ítem a "En progreso"; cuando se termina,
moverlo (con fecha) a `04-MILESTONES.md` y borrarlo de aquí o marcarlo hecho.

## En progreso
- **Mejoras tomadas de la plataforma admin de Oficinas Felices (2026-10).** Alcance,
  fases A–D y decisiones de Jose en `07-REFERENCIA-PLATAFORMA-OF-2026-10.md`. Base:
  rama `integracion/referencia-of`, que ya incluye las 10 ramas pendientes de
  septiembre. **Estado: mockups esperando la aprobación de Jose; nada implementado
  todavía.**
  - A — Estado "En espera" con motivo + pausa del SLA.
  - B — Catálogo de espacios por locación + dirección y responsable de la locación.
  - C — Formulario de nuevo ticket: ¿Dónde y qué? → Detalles (espacio, ubicación,
    título).
  - D — Lista de tickets con columna "Vence" + vista SLA (Vencidos / En riesgo).

## Completado (pendiente de revisar si vuelve a tocarse `firestore.rules`)
- **Fase 1 (Firebase Authentication), Fase 2 (rol Empleado ampliado), seguridad
  por fila de `tickets`/`notificaciones`, Fase 3 (auto-registro con aprobación
  de Locatario), Fase 4 (calificación del servicio), Fase 5 (catálogo de
  Suplidores) y Fase 6 (Dashboard ampliado)** — en producción desde
  2026-09-02/07, probadas por Jose. Con la Fase 6 se cierra el plan de 6 fases
  de `06-BRIEF-Y-PROMPT-REVISION-2026-09.md`. Ver `04-MILESTONES.md`.

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
- De la plataforma OF (Jose no dio preferencia, 2026-10-29): prioridad **Crítica**
  (4 niveles), rol **Admin cliente** (ve los tickets de toda su empresa), **invitar
  usuario por correo**, número de ticket secuencial `OF-2026-000012`. Detalle en
  `07-REFERENCIA-PLATAFORMA-OF-2026-10.md`.
- Restringir con `affectedKeys().hasOnly([...])` qué campos puede editar el
  Locatario dueño de un ticket (hoy la regla `update` le permite cambiar
  cualquiera).
- Agregar **iUKEN Business Center** como locación (aparece en la plataforma OF).
  Pendiente de que Jose confirme.

---
Cuando el usuario pida algo nuevo que no se vaya a implementar de inmediato, registrarlo
aquí en vez de dejarlo solo en el historial de chat.
