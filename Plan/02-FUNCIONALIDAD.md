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
6. El Dashboard (Administrador con control total; Empleado en solo lectura desde la
   Fase 2) muestra: tickets por categoría, por locación, distribución por estatus,
   promedio de días de solución (general y por categoría), tendencia mensual, y
   desde la Fase 6: vencidos en tiempo real, tasa de reapertura, tiempo promedio de
   primera respuesta, calificación promedio del servicio, y carga de tickets
   abiertos por responsable (personal interno o suplidor) — ver "Dashboard
   ampliado" más abajo.

## Flujo de estatus

**Desde 2026-10 (Fase A, `Plan/07`):** Nuevo → En proceso ⇄ **En espera** →
Cerrado.
- **Motivo obligatorio:** "En espera" exige uno: cliente, proveedor o aprobación.
- **Pausa del SLA:** mientras el ticket está en espera, el reloj del SLA de
  resolución se detiene (`sla_pausado_ms`, `msEnEspera()`).
- **Motivo "cliente":**
  - El locatario recibe "Necesitamos tu respuesta".
  - Cuando comenta, el ticket vuelve solo a En proceso.
  - Staff recibe "El cliente respondió".

**Simplificado el 2026-09-01: Nuevo → En proceso → Cerrado** (3 pasos). Se quitaron "En revisión" y "Resuelto".
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

## Dashboard ampliado (Fase 6, 2026-09)

Se agregaron 3 KPIs y un gráfico nuevo al Dashboard existente, todos calculados
en el cliente a partir de los tickets ya sincronizados (sin colecciones ni
reglas de Firestore nuevas):

- **Vencidos (fuera de SLA)** ya era en tiempo real desde antes de esta fase —
  `isVencido()` se recalcula contra la fecha actual en cada render, no depende
  de un valor guardado.
- **Tasa de reapertura**: de los tickets que llegaron a cerrarse alguna vez
  (tienen `fecha_resolucion`, o ya se reabrieron), qué porcentaje se reabrió al
  menos una vez. Se agregó el campo `reaperturas` (contador) al ticket,
  incrementado en `reabrirTicket()` — los tickets de antes de esta fase
  simplemente empiezan en 0 (no se puede reconstruir con certeza a partir del
  texto libre del historial viejo).
- **Tiempo promedio de primera respuesta** (aproximado): no existía un
  timestamp dedicado para "cuándo lo tocó staff por primera vez", así que se
  aproxima con el primer dato disponible entre el segundo registro del
  historial (el primero es la creación) y el primer comentario de un rol
  staff, lo que ocurra antes. Documentado como aproximación a propósito: es
  mejor que nada, pero no es un dato capturado explícitamente.
- **Calificación promedio**: promedio de `calificacion` (Fase 4) solo entre
  tickets ya calificados, con el conteo entre paréntesis.
- **Carga por responsable**: gráfico de barras con tickets **abiertos**
  (mide carga de trabajo actual, no historial completo) agrupados por
  `asignado_a` — personal interno o suplidor (Fase 5); tickets sin asignar
  quedan fuera a propósito.

## SLA e indicador de "Vencido"
- **Dos plazos por prioridad**, editables en Configuración:
  - **Primera respuesta** (horas).
  - **Resolución** (días).
- **Valores por defecto:**
  - Alta: 2 h / 2 días.
  - Media: 8 h / 5 días.
  - Baja: 24 h / 10 días.
- **Resolución:** no cuenta el tiempo En espera.
- **"En riesgo":** el próximo plazo vence en menos de 4 h (respuesta) o 24 h
  (resolución). Es fijo por ahora (`SLA_RIESGO_MS`).
- **Dónde se ve:**
  - Columna "Vence" de la lista.
  - Bloque "Reloj del SLA" del detalle.
  - Vista **SLA** (staff) con las listas Vencidos y En riesgo, más un contador en el
    menú lateral.

## Otras funciones de help desk
- Cualquier rol puede crear tickets.
  - Admin/Empleado los crean a su propio nombre ("Yo") o a nombre de un locatario
    (reportes telefónicos).
  - Formulario en 2 pasos (Fase C, 2026-10):
    - **¿Dónde y qué?:** edificio, tipo de incidencia (oficina de un inquilino / área
      común) y categoría.
    - **Detalles:** área o ubicación en texto libre (obligatoria en área común),
      título, descripción, prioridad y fecha.
  - **Sin catálogo de espacios**, por decisión de Jose (2026-10-29).
- Hilo de comentarios en cada ticket.
- Reabrir ticket cerrado si el problema persiste.
- Exportación de tickets a CSV.

## Secciones del panel de escritorio (Admin/Empleado, ≥1024px)
- **Tickets** — vista principal.
  - Pestañas por estado con conteo.
  - Filtro "Solo en riesgo o vencidos".
  - Tabla con columna "Vence" (Fase D).
- **SLA** (staff, Fase D, 2026-10) — tickets abiertos vencidos o en riesgo, por
  plazo y edificio. No lleva tarjetas de indicadores.
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

**Desde 2026-10**, campos opcionales nuevos (los tickets anteriores no los tienen y
`sanitizeTicket()` les pone valores por defecto):
- **"En espera" (Fase A):**
  - `espera_motivo`: `cliente` | `proveedor` | `aprobacion`.
  - `espera_desde`: ISO.
  - `sla_pausado_ms`: número.
- **Formulario (Fase C):**
  - `titulo`: si falta, se muestra categoría · subcategoría.
  - `tipo_incidencia`: `inquilino` | `area_comun`; por defecto `inquilino`.
  - `ubicacion_detalle`: texto libre.
- **Historial:** las entradas pueden traer `espera_motivo`.
- **Tipos de notificación nuevos:** `espera_cliente`, `cliente_respondio`.

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
D1–D4 = DIX Business Center 1–4, más **IUK = iUKEN Business Center**. IUK ya existía
en producción y se agregó a los valores por defecto el 2026-10-29 (Red de Oficinas
Felices). Específicas de este primer
despliegue — no genéricas de ASIGNA como producto.

## Identidad visual
- Marca: ASIGNA (logotipo "asigna" en minúsculas + destello, `logo-hero.jpg`).
- Color de acento (`--accent`): `#E0C01A` (amarillo exacto del logo, extraído por
  muestreo de píxeles).
- `icon-192.png` / `icon-512.png`: recorte cuadrado del mismo logo.
