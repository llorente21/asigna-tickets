# Roadmap — cambios futuros / pendientes

Lista viva de mejoras propuestas o pendientes, no comprometidas a una fecha. Cuando se
empieza a trabajar en algo de aquí, mover el ítem a "En progreso"; cuando se termina,
moverlo (con fecha) a `04-MILESTONES.md` y borrarlo de aquí o marcarlo hecho.

## En progreso
- **Fase 1 (Firebase Authentication) y Fase 2 (rol Empleado ampliado): código listo,
  falta el paso manual de Jose.** `index.html` ya migra cada cuenta a Firebase
  Authentication la primera vez que inicia sesión ("migración perezosa"), ya manda
  el token en cada llamada a Firestore, y ya permite a Empleado gestionar perfiles de
  Locatario + ver el Dashboard en solo lectura. **Falta:** que Jose confirme que las 3
  cuentas de rol iniciaron sesión al menos una vez con este código, y luego pegue las
  reglas nuevas de Firestore (README.md sección 3.1) en la consola — ese paso es el
  que activa la protección real. Ver `06-BRIEF-Y-PROMPT-REVISION-2026-09.md`.

## Pendiente — prioridad alta
- **Seguridad por fila para `tickets`/`notificaciones` (Sub-parte B de la Fase 1).**
  Aun con las reglas nuevas de la sección 3.1, cualquier cuenta autenticada (incluida
  una de Locatario) puede listar la colección completa de tickets/notificaciones vía
  el endpoint REST simple de "listar documentos" — las reglas de `list` de Firestore
  no pueden filtrar por documento salvo con consultas estructuradas (`:runQuery`) con
  un `where` que la regla valide, y el cliente de ASIGNA hoy no las usa. Esto importa
  especialmente porque distintas empresas (Locatarios) no deberían poder ver los
  tickets de otras. Requiere: reescribir el fetch de tickets para el rol Locatario a
  `:runQuery` filtrado por `empleado_email` (el campo que en realidad guarda el email
  de quien reportó el ticket, pese al nombre heredado), y una regla de `list` que
  valide ese filtro. No se hizo junto con la Fase 1 para no mezclar dos reescrituras
  riesgosas en un mismo cambio — se prueba y se despliega aparte.
- **Plan de ajustes 2026-09 — fases restantes.** Detalle completo en
  [`06-BRIEF-Y-PROMPT-REVISION-2026-09.md`](06-BRIEF-Y-PROMPT-REVISION-2026-09.md):
  3. **Auto-registro con aprobación** para Locatario — depende de que la Fase 1 ya
     esté con las reglas nuevas activas.
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
