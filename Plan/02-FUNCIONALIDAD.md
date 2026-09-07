# Funcionalidad — ASIGNA

Sistema de tickets/help desk para la Red de Oficinas Felices (coworking, locaciones
D1–D4 = DIX Business Center 1–4). ASIGNA es el nombre/marca propia de la app — este es
su primer despliegue, pero está pensada como producto con identidad propia.

## Roles (3)

- **Administrador** — control total: tickets, usuarios (cualquier rol), Dashboard.
- **Empleado** — staff interno que asiste a la administración; ve y gestiona todos los
  tickets (cualquier locación), comenta, actualiza estatus, crea tickets a nombre de un
  locatario. **Desde 2026-09:** ve el Dashboard en solo lectura, y puede crear/editar
  cuentas de rol **Locatario** desde Usuarios (nunca cuentas Admin/Empleado, ni
  otorgarse ni otorgar a otros un rol igual o superior al suyo). No elimina usuarios
  ni tickets.
- **Locatario** — inquilino que reporta incidencias de su oficina (D1–D4) y da
  seguimiento a sus propios tickets.

## Flujo de negocio

1. El locatario inicia sesión (cuenta creada por administración, asociada a su
   locación D1–D4). Administración/Empleado también pueden crear un ticket a nombre de
   un locatario (ej. reporte telefónico) — eligen "reportado por".
2. Crea un ticket: categoría/subcategoría de incidencia + descripción (+ marcar
   urgente).
3. Se generan notificaciones in-app: una para el equipo (Admin + Empleado), una de
   confirmación para el locatario.
4. Administración o Empleado revisan, actualizan estatus, asignan responsable y
   prioridad, y pueden comentar en el ticket — cada cambio queda en el historial con
   fecha, y se notifica al locatario en cada cambio de estatus.
5. Si el problema persiste, Admin/Empleado o el locatario dueño del ticket pueden
   reabrir un ticket cerrado — vuelve a "En proceso" y administración lo retoma.
6. El Dashboard (solo Administrador) muestra: tickets por categoría, por locación,
   distribución por estatus, promedio de días de solución (general y por categoría) y
   tendencia mensual.

## Flujo de estatus (simplificado desde 2026-09-01)

**Nuevo → En proceso → Cerrado** (3 pasos). Se quitaron "En revisión" y "Resuelto".
Reabrir un ticket cerrado lo regresa directamente a "En proceso" (antes iba a "En
revisión"). La evaluación de conformidad del locatario (1-5 estrellas), quitada en
este cambio, volvió en la Fase 4 (2026-09) — ver "Calificación del servicio" más
abajo.

Nota técnica ya no aplica: las reglas de Firestore vigentes (README.md sección 3.1,
desde la Fase 3) no restringen `tickets` → `allow update` a una lista de estatus —
solo la creación exige `status == 'nuevo'`. La lista de 5 estatus antiguos solo
aparece en las reglas históricas (README.md sección 3.2), ya reemplazadas.

## Suplidores como catálogo de responsables (Fase 5, 2026-09)

"Suplidor" es una **etiqueta/categoría de responsable, sin cuenta propia** — no
entra a ASIGNA, alguien interno (Admin/Empleado) lo registra y le da
seguimiento. Al actualizar un ticket, staff elige a quién queda asignado desde
un selector con 3 opciones: **Personal interno** (cualquier Admin/Empleado),
**Suplidor externo** (del catálogo nuevo en Suplidores) u **Otro** (texto
libre, para no perder flexibilidad ni romper tickets viejos que ya tenían un
`asignado_a` de texto libre antes de esta fase). El nombre elegido queda
guardado en el propio ticket (`asignado_a`), visible en su detalle para
cualquiera que lo vea — el Locatario no necesita ni tiene acceso al catálogo
de Suplidores en sí. La exportación CSV ahora incluye "Responsable" y
"Tipo_responsable".

## Calificación del servicio (Fase 4, 2026-09)

Cuando un ticket queda **cerrado**, el Locatario que lo reportó (y solo él, no
staff ni otros Locatarios) ve en el detalle del ticket una pregunta con 5
estrellas para calificar el servicio recibido. Al elegir una calificación (no se
puede cambiar después) se guarda `calificacion` (1-5) y `calificacion_fecha` en el
ticket, se le avisa a `staff` con una notificación, y desde ese momento cualquiera
que abra el ticket ve las estrellas ya asignadas (de solo lectura). No requirió
reglas de Firestore nuevas: la regla vigente de `allow update` para `tickets` ya
deja que el dueño del ticket (`resource.data.empleado_email == miEmail()`) edite
su propio documento sin restringir qué campos toca. También se agregó una columna
"Calificacion" a la exportación CSV.

## SLA e indicador de "Vencido"
Por prioridad: alta 2 días / media 5 días / baja 10 días. KPI visible en el Dashboard.

## Otras funciones de help desk
- Cualquier rol puede crear tickets (Admin/Empleado con "reportado por" para
  reportes telefónicos).
- Hilo de comentarios en cada ticket.
- Reabrir ticket cerrado si el problema persiste.
- Exportación de tickets a CSV.

## Secciones del panel de escritorio (Admin/Empleado, ≥1024px)
- **Tickets** — vista principal.
- **Usuarios** — las 3 cuentas (Admin, Empleado, Locatario) juntas; cada locatario
  muestra su empresa.
- **Empresas** — catálogo de compañías clientes (sin personas): nombre,
  oficina/locación, teléfono. Vista de tarjetas o lista.
- **Suplidores** (solo Admin, Fase 5) — catálogo de proveedores externos (nombre,
  especialidad, teléfono, correo opcional) que pueden quedar asignados a un
  ticket como responsable, sin tener cuenta propia en ASIGNA. Ver "Suplidores
  como catálogo de responsables" más abajo.
- **Áreas** — categorías de incidencia (nombre + subcategorías), editables.
- **Estados** y **Prioridades** — de solo lectura por ahora (catálogos editables
  quedan para una siguiente iteración — ver `03-ROADMAP.md`).
- **Configuración** — política de SLA, locaciones, acerca de.
- **Dashboard** — solo Administrador.

Locatarios y cualquier pantalla <1024px: experiencia móvil (header + tarjetas +
navegación inferior + botón +), sin estas secciones de panel.

## Modelo de datos por colección (Firestore)

### `usuarios/{email}`
Claves requeridas: `email`, `name`, `password`, `role` (`admin` | `empleado` |
`locatario`). El campo `password` es heredado de antes de Firebase Authentication
(ver `01-ARQUITECTURA.md`, sección "Autenticación de usuarios") — la autenticación
real ya no lo usa, solo queda como parte del esquema del documento. Campo opcional
`aprobado` (`bool`): solo lo escriben las cuentas creadas por auto-registro
(Fase 3) con `false`; si no existe, la cuenta se trata como aprobada. Ver
"Auto-registro con aprobación" en `01-ARQUITECTURA.md`.

### `tickets/{ticketId}`
Claves requeridas al crear: `id`, `numero`, `empleado_email`, `locacion`, `categoria`,
`descripcion`, `status`, `historial`. Status inicial: `nuevo`. Campos opcionales
`calificacion` (`1`-`5`) y `calificacion_fecha`: los pone el propio Locatario que
reportó el ticket, una vez cerrado — ver "Calificación del servicio" más abajo.
Campos opcionales `asignado_a` (nombre para mostrar), `asignado_tipo`
(`'interno'` | `'suplidor'` | `'manual'` | vacío) y `asignado_id` (correo del
empleado o id del suplidor) — ver "Suplidores como catálogo de responsables".

### `suplidores/{suplidorId}`
Claves requeridas: `id`, `nombre`. Opcionales: `especialidad`, `telefono`,
`email` (contacto del suplidor, no es una cuenta de acceso — un suplidor nunca
entra a ASIGNA). Solo staff (Admin/Empleado) puede leer y crear/editar; solo
Admin puede eliminar.

### `notificaciones/{notifId}`
Claves requeridas: `id`, `para`, `tipo`, `mensaje`, `fecha`, `leida`.

### `empresas/{empresaId}`
Claves requeridas: `id`, `nombre`.

### `categorias/{categoriaId}`
Claves requeridas: `id`, `nombre`. Por defecto la app siembra estas 7 la primera vez
que se conecta a un proyecto de Firebase nuevo:
- Aires Acondicionados → No enciende / No enfría
- Internet → No navega / No hay señal
- Limpieza
- Valet Parking
- Puertas, llavines y ventanas
- Luces
- Incidencias de agua → Filtración / Lluvias

## Locaciones
D1–D4 = DIX Business Center 1–4 (Red de Oficinas Felices). Específicas de este primer
despliegue — no genéricas de ASIGNA como producto.

## Identidad visual
- Marca: ASIGNA (logotipo "asigna" en minúsculas + destello, `logo-hero.jpg`).
- Color de acento (`--accent`): `#E0C01A` (amarillo exacto del logo, extraído por
  muestreo de píxeles).
- `icon-192.png` / `icon-512.png`: recorte cuadrado del mismo logo.
