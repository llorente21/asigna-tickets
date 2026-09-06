# Roadmap — cambios futuros / pendientes

Lista viva de mejoras propuestas o pendientes, no comprometidas a una fecha. Cuando se
empieza a trabajar en algo de aquí, mover el ítem a "En progreso"; cuando se termina,
moverlo (con fecha) a `04-MILESTONES.md` y borrarlo de aquí o marcarlo hecho.

## En progreso
_(vacío — ver "Pendiente — prioridad alta" para el plan de ajustes 2026-09 acordado
con Jose; detalle completo en `06-BRIEF-Y-PROMPT-REVISION-2026-09.md`)_

## Pendiente — prioridad alta (plan de ajustes 2026-09, decidido con Jose)
Detalle completo, justificación y orden sugerido en
[`06-BRIEF-Y-PROMPT-REVISION-2026-09.md`](06-BRIEF-Y-PROMPT-REVISION-2026-09.md)
(secciones 4 y 5). Resumen:

1. **Migrar a Firebase Authentication** (reemplaza el ítem anterior de este roadmap).
   Base de seguridad real: hoy las reglas de Firestore solo validan la forma de los
   datos, no quién escribe — cualquiera con el `apiKey` público puede leer `usuarios`
   (contraseñas en texto plano incluidas) o crear tickets válidos. Migración vía
   Identity Toolkit REST (`accounts:signUp`) reutilizando las contraseñas actuales,
   sin backend propio. Alto riesgo si se hace mal — probar las 3 cuentas de rol antes
   de tocar producción.
2. **Rol Empleado ampliado** (perfiles de Locatario + Dashboard de solo lectura) —
   se implementa junto con la Fase 1 porque toca las mismas reglas de Firestore.
3. **Auto-registro con aprobación** para Locatario — depende de la Fase 1.
4. **Calificación del servicio al cerrar ticket** (1-5 estrellas) — independiente,
   bajo riesgo, se puede hacer en paralelo.
5. **"Suplidor" como catálogo** de responsables externos (sin cuenta propia) —
   independiente, bajo riesgo.
6. **Dashboard ampliado** (carga por responsable, vencidos en tiempo real, tasa de
   reapertura, tiempo de primera respuesta, promedio de calificación) — al final,
   depende de datos que generan las Fases 2 y 4.

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
