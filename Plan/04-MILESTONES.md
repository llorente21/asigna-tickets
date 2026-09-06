# Milestones — historial de progreso

Entrada más reciente **arriba**. Cada entrada: fecha, qué se hizo, por qué (si no es
obvio), y estado. Este documento es lo primero que debe leer cualquier agente nuevo
para saber en qué punto está el proyecto.

---

## 2026-09-02 — Primer push a `main` con Plan/ y CLAUDE.md (vía device login)
Se hizo merge fast-forward de `plan/carpeta-planificacion` a `main` y push a
`origin/main` (`84c88f2` → `d5eeee0`) por instrucción de Jose. El entorno no tenía
credenciales de git configuradas; se autenticó usando el flujo de GitHub device
login (ver procedimiento documentado en `01-ARQUITECTURA.md` y la lección aprendida
en `05-ESTANDARES.md`). Verificado en GitHub que `CLAUDE.md` y `Plan/` ya están en
`main` remoto (no hay nada que verificar en producción/GitHub Pages porque este
cambio no toca `index.html`).

## 2026-09-02 — Fases 1 y 2 en producción, probadas con las 3 cuentas
Jose activó Firebase Authentication (Email/Password) en la consola —no estaba
activado, causa del primer intento fallido de login— y publicó las reglas de
Firestore de la sección 3.1 del README. Probó las 3 cuentas de rol (Admin, Empleado
`katherine@...`, Locatario `hola@...`) en local antes y después de publicar las
reglas: todas migraron a Firebase Authentication correctamente y la app siguió
funcionando. Se hizo merge a `main` y push (`b8e0fc7` → `a7c6578`) — verificado en
producción (`https://llorente21.github.io/asigna-tickets/`) vía el navegador
integrado, que cargó con una sesión activa (solo posible con el flujo de Auth ya
desplegado).

## 2026-09-02 — Seguridad por fila para tickets/notificaciones: código listo
Rama `plan/seguridad-por-fila-tickets`. Se agregó `fbQuery()` (Firestore
`:runQuery`, consulta estructurada con filtro de igualdad) y se cambió `enterApp`/
`syncFromFirebase` para que un Locatario pida sus tickets/notificaciones filtrados
por `empleado_email`/`para` en vez de listar la colección completa (que hacían con
`fbGet`, igual que staff). Reglas nuevas escritas en README.md sección 3.2
(`allow get/list` separados por `resource.data.<campo> == miEmail()`), pendientes de
publicar — el código ya funciona con las reglas de 3.1 (activas), así que se puede
probar antes de pegar las de 3.2. Sin verificar contra Firebase real por el agente
(mismo límite de red de siempre) — pendiente de que Jose repita la prueba de las 3
cuentas.

## 2026-09-02 — Fase 1 (Firebase Authentication) y Fase 2 (rol Empleado ampliado): código listo
Implementado en `index.html` (rama `plan/revision-seguridad-ux-dashboard`, sin
desplegar todavía): login vía Firebase Authentication REST con migración perezosa
(cada cuenta se migra sola, comparando contra su contraseña heredada en Firestore, la
primera vez que inicia sesión con este código); todas las llamadas a Firestore ahora
mandan `Authorization: Bearer <idToken>`; un Locatario ya no descarga la colección
completa de `usuarios` (ni sus contraseñas); Empleado puede crear/editar cuentas de
rol Locatario (nunca Admin/Empleado) y ve el Dashboard en solo lectura; el formulario
de Usuarios reemplaza "fijar contraseña de otro" por "enviar enlace de
restablecimiento" (limitación real de un cliente sin backend/Admin SDK). Reglas de
Firestore nuevas escritas y documentadas (README.md sección 3.1), pendientes de que
Jose confirme que las 3 cuentas de rol iniciaron sesión con este código y luego las
pegue en la consola. Verificado: sintaxis del script sin errores (`node --check`) y
el archivo sirve correctamente en local (`node _devserver.cjs`) — **falta la prueba
real contra Firebase en un navegador de verdad**, porque el entorno del agente no
tiene salida de red hacia `googleapis.com` (egress bloqueado por política de la
organización); esa prueba la tiene que hacer Jose antes de pegar las reglas nuevas o
subir a `main`. Queda pendiente, documentado como Sub-parte B en `03-ROADMAP.md`:
seguridad por fila para que un Locatario no pueda listar tickets de otras empresas a
nivel de base de datos (las reglas de Firestore `list` no filtran por documento con
el endpoint REST simple que usa ASIGNA).

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
