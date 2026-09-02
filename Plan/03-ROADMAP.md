# Roadmap — cambios futuros / pendientes

Lista viva de mejoras propuestas o pendientes, no comprometidas a una fecha. Cuando se
empieza a trabajar en algo de aquí, mover el ítem a "En progreso"; cuando se termina,
moverlo (con fecha) a `04-MILESTONES.md` y borrarlo de aquí o marcarlo hecho.

## En progreso
_(vacío — nada en progreso al crear este documento)_

## Pendiente — prioridad alta
- **Seguridad real por rol vía Firebase Authentication.** Hoy las reglas de Firestore
  solo validan la *forma* de los datos, no *quién* escribe (login casero, sin Auth).
  Cualquiera con el `apiKey` público puede leer `usuarios` (incluidas contraseñas en
  texto plano) o crear tickets válidos. Migrar a Firebase Authentication (o al menos
  hashear contraseñas) es la mejora de seguridad pendiente más importante. No bloquea
  el uso interno normal, pero es una deuda técnica real.

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
