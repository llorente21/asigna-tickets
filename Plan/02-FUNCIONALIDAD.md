# Funcionalidad — ASIGNA

Sistema de tickets/help desk para la Red de Oficinas Felices (coworking, locaciones
D1–D4 = DIX Business Center 1–4). ASIGNA es el nombre/marca propia de la app — este es
su primer despliegue, pero está pensada como producto con identidad propia.

## Roles (3)

- **Administrador** — control total: tickets, usuarios, Dashboard.
- **Empleado** — staff interno que asiste a la administración; ve y gestiona todos los
  tickets (cualquier locación), comenta, actualiza estatus, crea tickets a nombre de un
  locatario. No gestiona usuarios, no elimina tickets, no ve el Dashboard.
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

**Nuevo → En proceso → Cerrado** (3 pasos). Se quitaron "En revisión" y "Resuelto", y
con ellos la evaluación de conformidad del locatario (1-5 estrellas) — ya no existe ese
paso ni esa métrica. Reabrir un ticket cerrado lo regresa directamente a "En proceso"
(antes iba a "En revisión").

⚠️ Nota técnica: las reglas de Firestore (`tickets/{ticketId}` → `allow update`) todavía
listan los 5 estatus antiguos (`'nuevo','en_revision','en_proceso','resuelto','cerrado'`)
por compatibilidad — no bloquean nada, pero si se hace limpieza de reglas conviene
alinearlas al flujo de 3 pasos.

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
`locatario`). Contraseña en texto plano (ver limitación de seguridad en
`01-ARQUITECTURA.md`).

### `tickets/{ticketId}`
Claves requeridas al crear: `id`, `numero`, `empleado_email`, `locacion`, `categoria`,
`descripcion`, `status`, `historial`. Status inicial: `nuevo`.

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
