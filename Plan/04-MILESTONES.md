# Milestones — historial de progreso

Entrada más reciente **arriba**. Cada entrada: fecha, qué se hizo, por qué (si no es
obvio), y estado. Este documento es lo primero que debe leer cualquier agente nuevo
para saber en qué punto está el proyecto.

---

## 2026-09-02 — Carpeta `Plan/` y `CLAUDE.md` de referencia para agentes
Se creó esta carpeta (`Plan/`) como fuente de verdad de planificación para cualquier
agente que trabaje en el repo (código o diseño), y `CLAUDE.md` en la raíz para que
Claude Code la cargue automáticamente al iniciar sesión en este proyecto. Objetivo:
que ningún agente empiece una tarea sin saber qué se ha hecho, cómo está armado el
proyecto y qué convenciones seguir — y que cada agente deje el rastro de su trabajo
para el siguiente.
**Rama:** `plan/carpeta-planificacion` (pendiente de merge/push a `main` por
instrucción del usuario).

## 2026-09-02 — `git pull origin main` (9d94be7 → 84c88f2)
Se trajeron los mockups de Claude Design (ver más abajo) que se habían generado en otra
sesión/rama y ya estaban en `main` remoto.

## ~2026-09-01/02 — Mockups de diseño en `design/`
Se agregó la carpeta `design/` con dos exploraciones hechas en Claude Design a partir
del `index.html` real:
- `asigna-estado-actual.html` — la interfaz actual reconstruida con sus tokens reales.
- `asigna-tres-direcciones.html` — tres direcciones visuales propuestas (1a Luz de
  día, 1b Vecinos, 1c Panel claro).
Ninguna dirección ha sido adoptada todavía — queda como exploración en
`03-ROADMAP.md`. Los archivos `.dc.html` fuente y assets están en `design/source/`.

## 2026-09-01 — Empresas separadas de Usuarios + mejoras de UI
Empresas pasa a ser un catálogo propio (nombre, oficina/locación, teléfono) separado
de Usuarios (las 3 cuentas de personas); el ticket ahora referencia la empresa/cliente
como campo desacoplado de quien reporta. Se agregó vista de tarjetas/lista, formulario
completo de Empresas, y varios ajustes de UI en el panel de escritorio (topbar,
alternador de vista, alineación del logo del sidebar).

## 2026-09-01 — Flujo de estatus simplificado: Nuevo → En proceso → Cerrado
Se quitaron los pasos "En revisión" y "Resuelto", y con ellos la evaluación de
conformidad del locatario (1-5 estrellas) — ya no existe ese paso ni esa métrica en
Dashboard/CSV. Reabrir un ticket cerrado ahora regresa directo a "En proceso". Áreas
(categorías de incidencia) se volvieron editables (crear/editar/eliminar) desde el
panel de administración.

## ~2026-08-30 — Panel de escritorio con sidebar + rebrand a ASIGNA
En pantallas ≥1024px, Administrador y Empleado ven un panel tipo escritorio (sidebar +
topbar + contenido) con secciones: Usuarios, Empresas, Áreas, Estados, Prioridades,
Configuración. Locatarios y pantallas angostas (<1024px) mantienen la experiencia
móvil original. Se aplicó el rebrand completo de "Oficinas Felices" a **ASIGNA**
(header, splash, login, título de pestaña, `manifest.json`, ícono) y se reemplazó el
ícono generado por el logotipo real (`logo-hero.jpg`), ajustando `--accent` al amarillo
exacto del logo (`#E0C01A`) por muestreo de píxeles.

## ~2026-08-28/29 — Funciones estándar de help desk + modelo de 3 roles
Cualquier rol puede crear tickets (Admin/Empleado con "reportado por" para reportes
telefónicos); hilo de comentarios por ticket; reabrir ticket cerrado; indicador de
"Vencido" según SLA por prioridad (alta 2d / media 5d / baja 10d) con KPI en
Dashboard; exportación a CSV. Se definió el modelo de 3 roles (Administrador, Empleado,
Locatario) reemplazando un modelo anterior más simple.

## 2026-08-27 — Primer despliegue: ASIGNA, sistema de tickets
Commit inicial del repo tal como existe hoy: interfaz completa (login, roles, CRUD de
tickets, notificaciones in-app, dashboard, gestión de usuarios, PWA), conectado a
Firebase (proyecto `asigna-feliz`), reglas de Firestore cerradas (ya no en modo
prueba), en producción en
[llorente21.github.io/asigna-tickets](https://llorente21.github.io/asigna-tickets/).

---

_Nota: las fechas de las entradas anteriores a 2026-09-02 se estimaron a partir del
historial de `git log` y las fechas de modificación de archivos al momento de crear
este documento — no fueron registradas en tiempo real. A partir de aquí, cada entrada
nueva debe llevar la fecha real del día en que se hizo el trabajo._
