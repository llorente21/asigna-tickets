# Milestones — historial de progreso

Entrada más reciente **arriba**. Cada entrada: fecha, qué se hizo, por qué (si no es
obvio), y estado. Este documento es lo primero que debe leer cualquier agente nuevo
para saber en qué punto está el proyecto.

---

## 2026-09-07 — Fase 5 ("Suplidor" como catálogo): confirmada por Jose
Probada en producción: crear un suplidor y asignarlo a un ticket funcionó
correctamente. Fase 5 cerrada.

## 2026-09-07 — Fase 6 (Dashboard ampliado): código listo, sin probar
Rama `plan/dashboard-ampliado`. `renderDashboard()` gana 3 KPIs y un gráfico
nuevo, todos calculados en el cliente a partir de los tickets ya sincronizados
(sin colecciones ni reglas de Firestore nuevas): tasa de reapertura (nuevo
campo `reaperturas` en el ticket, incrementado en `reabrirTicket()` —
tickets viejos empiezan en 0), tiempo promedio de primera respuesta
(aproximado: primer historial después de la creación o primer comentario de
staff, lo que ocurra antes — no había un timestamp dedicado para esto),
calificación promedio (Fase 4, solo entre tickets ya calificados), y un
gráfico de barras "Carga por responsable" con tickets **abiertos** agrupados
por `asignado_a` (Fase 5, personal interno o suplidor). "Vencidos" ya era en
tiempo real desde antes de esta fase (se recalcula en cada render, no
depende de un valor guardado) — se documentó explícitamente para dejar
claro que no hacía falta ningún cambio ahí. Verificado: sintaxis
(`node --check`) y que el archivo sirve en local. **No verificado contra
Firebase real** (mismo límite de red de siempre) — pendiente de que Jose
confirme que el Dashboard carga bien y que los números nuevos cuadran con
los tickets reales antes de subir a `main`.

Con esta fase queda completo el plan de ajustes 2026-09 (las 6 fases del
brief original en `06-BRIEF-Y-PROMPT-REVISION-2026-09.md`). Próximo paso
decidido con Jose: rediseño visual completo de la app con Claude Design, en
un solo pase, una vez confirmada esta fase.

## 2026-09-07 — Fase 4 (calificación del servicio): confirmada por Jose
Probada en producción: cerrar un ticket como staff y calificarlo (1-5
estrellas) como el Locatario que lo reportó funcionó correctamente. Fase 4
cerrada.

## 2026-09-07 — Fase 5 ("Suplidor" como catálogo): código listo, sin probar
Rama `plan/suplidores`. Nueva colección `suplidores` (id, nombre, especialidad,
teléfono, email opcional) con su propia sección de administración (solo Admin,
mismo patrón que Empresas: `suplidorCardHTML`/`suplidoresTableHTML`/
`renderSuplidoresList`/`openSuplidorForm`/`saveSuplidor`/`deleteSuplidorForm`).
Al actualizar un ticket, el campo "Asignado a" pasó de un input de texto libre
a un selector de 3 tipos (`onAsignadoTipoChange()`): **Personal interno**
(cualquier Admin/Empleado, guarda su correo en `asignado_id`), **Suplidor
externo** (del catálogo nuevo, guarda su id) u **Otro** (texto libre, para no
romper tickets viejos que ya tenían `asignado_a` como texto plano — se migran
solos a tipo `'manual'` vía `sanitizeTicket`). El nombre elegido se sigue
guardando en `asignado_a` como antes (compatibilidad), y ahora también se
muestra en el detalle del ticket para cualquiera que lo vea (antes no se
mostraba en ningún lado fuera del formulario de staff). Se agregaron columnas
"Responsable"/"Tipo_responsable" a la exportación CSV. `SUPLIDORES_LIST` se
sincroniza para todo staff (no solo Admin), porque Empleado también asigna
tickets, aunque la vista de administración del catálogo sigue siendo solo de
Admin.

Reglas de Firestore nuevas escritas en README.md sección 3.2: `suplidores`
solo lo lee/escribe staff, solo Admin lo borra — un Locatario no necesita
acceso al catálogo porque el nombre del responsable ya viene en su propio
ticket. Verificado: sintaxis (`node --check`) y que el archivo sirve en local.
**No verificado contra Firebase real** (mismo límite de red de siempre) —
pendiente de que Jose pegue las reglas nuevas y pruebe crear/asignar un
suplidor antes de subir a `main`.

## 2026-09-07 — Fase 4 (calificación del servicio): código listo, sin probar
Rama `plan/calificacion-servicio`. Al cerrar un ticket, `renderDetailBody()`
muestra 5 estrellas clicables solo al Locatario que lo reportó (`calificarTicket()`
guarda `calificacion` 1-5 y `calificacion_fecha`, agrega un renglón al historial y
notifica a `staff`); una vez calificado, cualquiera que abra el ticket ve las
estrellas de solo lectura (`starsHTML()`). No hizo falta ninguna regla de
Firestore nueva — la regla vigente de `allow update` para `tickets` ya deja que el
dueño del ticket edite su propio documento sin restringir campos. Se agregó
también una columna "Calificacion" a la exportación CSV. De paso se corrigió una
nota desactualizada en `02-FUNCIONALIDAD.md` que hablaba de una restricción de
estatus en las reglas de `tickets` que ya no existe desde la Fase 3. Verificado:
sintaxis (`node --check`) y que el archivo sirve en local. **No verificado contra
Firebase real** (mismo límite de red de siempre) — pendiente de que Jose pruebe
cerrar un ticket y calificarlo antes de subir a `main`.

## 2026-09-07 — Fase 3 (auto-registro con aprobación): publicada y confirmada
Jose probó el flujo completo en producción: registró una cuenta nueva desde
"Crea tu cuenta aquí", confirmó que quedó en "Cuenta pendiente", la aprobó desde
Usuarios y esa cuenta pudo entrar con normalidad; las 3 cuentas de rol existentes
siguieron funcionando igual. En el camino se encontraron y corrigieron dos cosas:
(1) el README documentaba mal que las reglas activas (entonces 3.1) ya permitían
el auto-registro — no era cierto, hacía falta pegar las reglas nuevas (entonces
3.2) para que el guardado del perfil no fallara por permisos; y (2) al aprobar
una cuenta, la notificación de "nuevo_registro" que avisó a staff se quedaba sin
marcar como leída — `approveUser()` ahora la marca leída usando el correo
(guardado en `ticket_id`) para encontrarla. Con las reglas nuevas ya pegadas y
confirmadas, se consolidó README.md: la sección 3.1 ahora es directamente el
ruleset con auto-registro (ya no hay una sección 3.2 "pendiente" aparte), y las
reglas históricas pre-Firebase-Auth pasaron a ser la 3.2. Merge fast-forward de
`plan/auto-registro-aprobacion` a `main` y push (`8fd98fb` → `52abd77`).

## 2026-09-06 — Fase 3 (auto-registro con aprobación): código listo, sin probar
Rama `plan/auto-registro-aprobacion`. Se agregaron pantallas `#register-screen`
("Crear cuenta", solo rol Locatario) y `#pending-screen` ("Cuenta pendiente"), y las
funciones `showRegisterScreen()`/`showPendingScreen()`/`handleRegister()`.
`handleRegister()` usa `firebaseSignUp()` primero (sirve también para detectar
correos duplicados vía `EMAIL_EXISTS`, ya que quien se registra no tiene sesión
todavía para leer Firestore) y luego guarda el perfil con `aprobado:false` y
notifica a `staff`. `handleAuth()` y el bootstrap de sesión ahora revisan
`userDoc.aprobado === false` y mandan a la pantalla de espera en vez de dejar
entrar. En Usuarios, `userCardHTML`/`usersTableHTML` muestran un badge "Pendiente"
y `openUserForm` agrega un botón "Aprobar cuenta" (`approveUser()`) visible para
quien tenga permiso de editar esa cuenta (Admin siempre, Empleado solo si es
Locatario). Se corrigió además un bug potencial en `saveUser()`: como `fbSet`
(PATCH) reemplaza el documento completo, guardar cualquier cambio en una cuenta
pendiente sin el campo `aprobado` explícito la habría aprobado por accidente —
ahora `saveUser()` preserva `aprobado` del documento anterior salvo que se apruebe
explícitamente con el botón nuevo. Reglas de Firestore nuevas escritas en
README.md sección 3.2 (funciones `miPerfilAprobado()`/`autorizado()`, usando el
accesor de dos argumentos `.get('aprobado', true)` para no romper con cuentas sin
ese campo). Verificado: sintaxis (`node --check`) y que el archivo sirve en local
(`node _devserver.cjs`). **No verificado contra Firebase real** por el mismo
límite de red del agente (sin salida a `googleapis.com`) — pendiente de que Jose
pruebe el flujo completo de registro/aprobación y las 3 cuentas existentes antes
de pegar las reglas nuevas o subir a `main`.

## 2026-09-02 — Seguridad por fila: publicada y confirmada en producción
Jose probó las 3 cuentas de rol con el código de `fbQuery()` (commit `8fd98fb`, ya
en `main`) y confirmó que todo funcionó bien (tickets, notificaciones, comentarios,
reabrir) antes y después de pegar las reglas nuevas de Firestore (README.md,
entonces sección 3.2, ahora consolidada en 3.1). Fase de "seguridad por fila para
tickets/notificaciones" cerrada.

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
