# Milestones — historial de progreso

Entrada más reciente **arriba**. Cada entrada: fecha, qué se hizo, por qué (si no es
obvio), y estado. Este documento es lo primero que debe leer cualquier agente nuevo
para saber en qué punto está el proyecto.

---

## 2026-10-30 — Fix: pantallas cortadas en laptops con zoom (rama `fix/pantallas-completas`, sin push)
Jose reportó pantallas que no se veían completas (captura del Dashboard a ~1525×704 px
CSS, laptop con zoom 125 %). Causas y arreglos:
- **Título y filtros cortados arriba:** `.desktop-main` es una columna flex con altura de
  pantalla y el encabezado (`min-height:0`) se encogía cuando el contenido era alto; su
  contenido se salía por arriba. Ahora `.desktop-main > *{flex-shrink:0}`.
- **Globo "1" flotando en el Dashboard:** la marca de inicialización del tooltip usaba
  `data-tip` en el propio contenedor. Ahora es `data-tip-init`.
- **Menú lateral cortado en pantallas bajas:** `.sidebar-nav` no podía desplazarse (faltaba
  `min-height:0`). Ahora se desplaza y, con alto ≤ 760 px, el menú es más compacto.
Verificado con Playwright a 1525×704, 1280×600 y 1440×900 en Dashboard, Tickets, SLA,
Nuevo ticket, Usuarios, Empresas, Suplidores y Configuración (arriba y al final).

## 2026-10-30 — Carga en bloque (CSV) de Suplidores y Empresas — en producción (`02ec201`)
Pedido de Jose: poder subir suplidores y empresas en bloque. Un solo motor para los dos
(`IMPORT_TIPOS`, `importarCSV`, `planImport`, `ejecutarImport`):
- **Archivo:** CSV con coma, punto y coma o tabulador; UTF-8 o Windows-1252 ("CSV" de
  Excel), así no se dañan los acentos. Un .xlsx muestra cómo guardarlo como CSV.
  Plantilla descargable para cada uno. Títulos flexibles ("teléfono", "tel", "correo",
  "email"…); el edificio acepta código o nombre ("D1" o "DIX Business Center 1").
- **Vista previa antes de guardar:** nuevos, se actualizan, sin cambios y omitidos,
  muestra de filas y avisos por fila (sin nombre, repetido, correo o edificio inválido).
- **Actualización por nombre** (sin importar mayúsculas ni acentos). Las celdas vacías
  no borran datos existentes (antes, importar Empresas sin una columna la vaciaba).
- **Guardado verificado:** cada registro se guarda en Firestore y se informa cuántos
  fallaron, con botón para reintentarlos. Si Firestore niega el permiso lo dice. Antes
  los fallos solo iban a la consola y los datos desaparecían en la siguiente
  sincronización (posible causa de los suplidores "perdidos").
- Guardar un suplidor o empresa a mano también avisa si el servidor no lo guardó.
Probado con Playwright (1440 y 390): archivos UTF-8 y Windows-1252, separadores, avisos,
fallo de permisos y reintento, plantilla. Falta la prueba de Jose con datos reales.

## 2026-10-30 — Ver/ocultar contraseña al iniciar sesión — en producción (`02ec201`)
Pedido de Jose. Botón con ícono de ojo dentro del campo de contraseña del inicio de
sesión y del registro de locatarios (44px, `aria-pressed`, el foco y el cursor se
mantienen). Al volver a la pantalla de acceso la contraseña empieza oculta.
**Seguridad:** se quitó la contraseña del admin que estaba escrita en `DEFAULT_USERS`
(visible para cualquiera en el código publicado). Sigue en el historial de git, así
que hay que cambiarla. Probado con Playwright (1440 y 390).

## 2026-10-30 — Fase E: Dashboard nuevo — en producción (`bbb83b6`)
Jose aprobó la propuesta del mockup "E · Dashboard". Reemplaza al Dashboard anterior:
- **Filtros** en el encabezado (escritorio) o arriba de la vista (teléfono): período
  (este mes / 3 meses / este año / todo) y edificio. Se recuerdan en el navegador
  (`of_db_filtros`).
- **Ahora mismo** (no depende del período): abiertos por estado, vencidos y en riesgo
  (mismas reglas que la vista SLA; al tocarlos abre SLA con ese edificio), en espera
  por motivo.
- **Período:** SLA de primera respuesta (creados en el período; usa
  `fecha_primera_respuesta` y, en tickets viejos, la aproximación por historial o
  comentario), SLA de resolución (cerrados en el período, sin contar la espera),
  reapertura y calificación. Verde ≥ 90 %, ámbar ≥ 75 %, rojo debajo.
- **Por edificio** (todos, resalta el filtrado), **abiertos por estado** (dona) con
  oficinas vs áreas comunes, **creados vs cerrados** de 6 meses, **por categoría**
  con promedio de solución, **carga por responsable** (incluye "Sin responsable") y
  **proveedores externos**.
- Colores de la dona validados para daltonismo (Nuevo en `#4A90E2`).
- Cambiar de vista ahora también vuelve arriba el área de contenido en escritorio.
Probado con Playwright (1440 y 390, datos de 6 meses): filtros, guardado, salto a SLA,
tooltip; sin errores ni desplazamiento horizontal. Subido a main el 2026-10-30 junto con
el diseño del canvas; despliegue de GitHub Pages verificado. Falta la prueba de Jose con
datos reales.

## 2026-10-30 — Diseño del canvas aplicado a toda la app — en producción (`c69ec42`)
Jose señaló que solo se había pasado la funcionalidad de los mockups y no su diseño.
Se aplicó el design system ASIGNA del canvas "Propuesta referencia OF":

**Escritorio**
- Menú lateral oscuro (`--dark`), enlace activo amarillo, contador del SLA.
- Encabezado de página: ruta en mayúsculas (`Operación / Tickets`) sobre el título en
  Public Sans 800 26px; sin la franja amarilla. `VIEW_SUBS` ahora guarda esas rutas.
- Botones "Exportar CSV" (contorno) y "+ Nuevo ticket" (amarillo) en el encabezado.
- Lista de tickets: tarjeta blanca con buscador y filtros a la vista (Edificio, Estado,
  Categoría y **Responsable**, nuevo: cualquiera / sin responsable / persona). En el
  teléfono siguen el embudo y el panel de filtros.
- Tablas: contenedor redondeado con sombra, cabecera crema en mayúsculas 10.5px.
- Etiquetas de estado, prioridad y vencido en tipo oración con tinta oscura (AA).
- Dashboard: KPI con la etiqueta arriba; títulos de gráficas en Public Sans 15px.
- Detalle del ticket: encabezado con ruta + número, título 22px, estado y cerrar;
  datos en 3 columnas (se suma "Categoría"); panel "Actualizar ticket" crema con
  título Public Sans; botón "Guardar cambios".

**Teléfono**
- Encabezado oscuro sólido. En Nuevo ticket: flecha para volver + título, sin ruta.
- Fix: el buscador ya no empuja el botón de exportar fuera de la pantalla (`min-width:0`).

**General:** campos de los paneles blancos con borde fino; cada vista abre desde arriba.
Probado con Playwright (escritorio 1440 y teléfono 390, staff y locatario, fuentes
reales): sin errores, filtro de responsable verificado. Falta la prueba de Jose.

## 2026-10-29 — Nuevo ticket en una sola pantalla (rediseño aprobado por Jose)

**Crítica de Jose al formulario de la Fase C:**
- Tenía demasiado texto explicativo, como si no confiara en que el formulario se
  entiende solo.
- No seguía el formulario del video: grande, en una sola pantalla, con secuencia
  visual.

**Mockup:** "Nuevo ticket v2" en el canvas, aprobado.

**Rama:** `feat/form-una-pantalla`, que sale de `main`.

**Cómo quedó:**
- **Ya no es un panel lateral en 2 pasos:** ahora es la vista `nuevo`, una pantalla
  completa con ruta "Tickets / Nuevo ticket".
- **Escritorio:** una tarjeta ancha en 2 columnas con campos de 52 px:

  | Izquierda | Derecha |
  |---|---|
  | Edificio | Tipo de incidencia |
  | Reportado por | Empresa afectada |
  | Categoría | Incidente |
  | Área o ubicación | Prioridad |
  | Título (ancho completo) | |
  | Descripción (ancho completo) | |

  Al final van los botones Cancelar · Crear ticket.
- **Teléfono:** una columna, el botón "Crear ticket" fijo abajo y la barra inferior
  oculta mientras se llena.
- **Se quitó:**
  - Títulos y subtítulos de paso, secciones numeradas y banners.
  - Textos de ayuda bajo los campos y la vista previa del SLA.
  - Las tarjetas de tipo, reemplazadas por una lista como en el video.
  - El campo de fecha: se guarda la hora de creación.
- **Reglas que se mantienen:**
  - Área común oculta "Empresa afectada" y hace obligatoria la ubicación.
  - El locatario ve su edificio bloqueado y sin "Reportado por" ni "Empresa".
  - El título se prellena con la categoría hasta que alguien lo edite.
  - Los datos guardados no cambian (mismos campos de la Fase C).
- **Lección de diseño:** ver `05-ESTANDARES.md`.

**Verificado:**
- `node --check` sin errores.
- Navegador sin conexión con datos simulados, en escritorio (1440px) y en móvil
  (390px):
  - Staff, área común: sin ubicación no deja guardar; con ubicación guarda sin empresa.
  - Locatario: guarda con su edificio y su empresa.
  - Sin errores de JS.

## 2026-10-29 — Quitar la fila de pestañas de estado de la lista de tickets (staff)

**Qué cambió:**
- A pedido de Jose se quitó la fila Todos · Nuevo · En proceso · En espera · Cerrado ·
  "Solo en riesgo o vencidos" de la vista Tickets de staff.
- El estado se filtra con el botón de filtros (embudo); vencidos y en riesgo se ven en
  la vista SLA.
- Los locatarios conservan sus pestañas Todos · Abiertos · Cerrados.

**Rama:** `fix/quitar-pestanas-estado`, que sale de `main`.

## 2026-10-29 — En producción: fases A, C y D + "¿Olvidaste tu contraseña?"

**Merge y push:**
- Jose probó en local contra Firebase real: creó un ticket de área común y lo pasó por
  En espera → En proceso; el plazo de resolución se corrió 2 min, que es el tiempo que
  estuvo en espera.
- Por su instrucción se hizo merge `--no-ff` de `feat/olvide-contrasena` (incluye
  todo) a `main`: commit `5f63170`.
- Push con GitHub device login.

**Verificación:**
- GitHub Pages desplegó `5f63170` (API `actions/runs`: success).
- En el navegador integrado, https://llorente21.github.io/asigna-tickets/ ya sirve la
  versión nueva: hay vista SLA, `STATUS_FLOW` incluye `en_espera`, existe el enlace
  "¿Olvidaste tu contraseña?" y la locación IUK.

**Pendiente:**
1. Jose revisa en producción las pruebas que faltan: detalle con reloj del SLA, vista
   SLA, móvil y borrar el ticket "Prueba".
2. Aprobar el mockup E (Dashboard).
3. Actualizar `README.md` raíz.

## 2026-10-29 — "¿Olvidaste tu contraseña?" en el inicio de sesión

**Motivo:** al ir a probar la rama, Jose no recordaba su contraseña. La pantalla de
login no tenía cómo recuperarla; solo un Admin podía mandar el enlace desde Usuarios.

**Rama:** `feat/olvide-contrasena`, que sale de `feat/lista-vence-sla` y por lo tanto
incluye A, C y D.

**Cómo funciona:**
- Hay un enlace "¿Olvidaste tu contraseña?" bajo el campo de contraseña.
- Usa el correo escrito arriba y llama a `firebaseSendPasswordReset()`
  (`accounts:sendOobCode`).
- El mensaje es el mismo exista o no la cuenta, para no revelar qué correos están
  registrados. Si hay demasiados intentos, se avisa.
- Las etiquetas del login ahora están asociadas a sus campos (`for`).
- **Firestore:** sin reglas nuevas.

**Verificado:** sintaxis y navegador con Firebase simulado (escritorio y móvil). **Falta
la prueba real**: que llegue el correo.

## 2026-10-29 (tarde) — Fases A, C y D implementadas; mockups ajustados; propuesta de Dashboard

**Feedback de Jose sobre los mockups:**
- Aprobados, salvo que la vista SLA no lleva tarjetas de indicadores.
- No hay propuesta de Dashboard → hacerla.
- Agregar iUKEN.
- **Sin catálogo de espacios**: ASIGNA es solo para incidentes.
- **Sin responsable por edificio.**

**Canvas actualizado:**
- Se quitaron las tarjetas de SLA, los espacios y el responsable por edificio.
- Se agregó iUKEN.
- Mockup nuevo **"E · Dashboard (propuesta)"**: filtros de período y edificio,
  "Ahora mismo", % de cumplimiento del SLA, tabla por edificio, oficinas frente a
  áreas comunes, creados frente a cerrados y "Sin responsable" visible.

**iUKEN:**
- Al abrir producción en el navegador integrado, iUKEN **ya existía con el código IUK**
  (caché local de la app; sin sesión iniciada).
- Jose eligió conservar IUK.
- Se agregó `IUK` a `DEFAULT_LOCACIONES` (commit `9257adf` en
  `integracion/referencia-of`).
- No se tocó producción.

**Ramas** (locales, sin push, cada una sale de la anterior):
- `feat/en-espera` — Fase A: estado En espera con motivo; el SLA de resolución
  descuenta la espera; "cliente respondió" lo regresa a En proceso; bloque "Reloj del
  SLA" en el detalle.
- `feat/form-donde-que` — Fase C:
  - Formulario ¿Dónde y qué? → Detalles, con tipo oficina / área común, ubicación
    libre y título.
  - Staff puede reportar a su propio nombre.
- `feat/lista-vence-sla` — Fase D:
  - Pestañas por estado, filtro de riesgo y tabla con columna "Vence".
  - Vista SLA con Vencidos y En riesgo, más un contador en el menú lateral.

**Verificado:**
- `node --check` sin errores.
- Pruebas en navegador sin conexión con datos simulados:
  - **Fase A:** sin motivo no deja guardar; motivo cliente → notificación al
    locatario; el locatario comenta → vuelve a En proceso con 3 h de pausa acumulada.
  - **Fase C:** staff "Yo" + área común exige ubicación y no manda confirmación a sí
    mismo; el locatario reporta con su empresa y edificio.
  - **Fase D:** estados de vencimiento correctos, filtro de riesgo, vista SLA en
    escritorio (1440px) y en móvil (390px).
  - Sin errores de JS.
- **No probado contra Firebase real.**

**Incidente corregido en la sesión:**
- El primer commit de la Fase A escribió una versión vieja de `index.html` (ver
  lección nueva en `05-ESTANDARES.md`).
- Se rehízo el commit (`24a6afd`) y se verificó por `md5sum` antes de cada commit
  siguiente.

**Pendiente:**
1. Jose prueba `feat/lista-vence-sla` (incluye todo) y decide el merge/push a `main`.
2. Aprueba o ajusta el mockup E (Dashboard).
3. Se actualiza `README.md` raíz (guía de usuario) con el estado En espera y la vista
   SLA cuando se suba a producción.

## 2026-10-29 — Revisión de la plataforma admin de Oficinas Felices + rama de integración

Jose compartió una grabación de la plataforma admin de Oficinas Felices
(`demo.admin.dixdigitalagency.com`) para tomar de ahí buenas prácticas, diseño y
formularios. El análisis completo y la propuesta por fases están en
`07-REFERENCIA-PLATAFORMA-OF-2026-10.md`.

Decisiones de Jose:
- Alcance: tickets + espacios.
- Base de trabajo: fusionar primero las ramas pendientes.
- Estados: los 3 actuales + "En espera" con motivo, que pausa el SLA.
- Extras: sin preferencia. Solo se propone la vista SLA; el resto queda en el
  roadmap.

Hecho:
- Rama **`integracion/referencia-of`** (local, sin push), creada desde `main`, con
  `review/todo-junto` + `review/diseno-junto`. En total, las 10 ramas de
  septiembre: SLA dos plazos, responsable interno, tipo primero, nota obligatoria y
  los rediseños de lista, detalle, formulario, dashboard y notificaciones.
- Conflictos resueltos:
  - Formulario: se mantiene el flujo en 2 pasos y dentro del paso 2 se aplican el
    banner y la grilla del rediseño.
  - Detalle: layout de 2 columnas + badges de SLA de dos plazos + Responsable /
    Asignado a (ejecuta).
- Fix: en teléfonos (<520px) el formulario pasa a una sola columna. Antes, "Reportado
  por" quedaba comprimido en "Loca…".
- Verificado:
  - `node --check` sin errores.
  - Prueba en navegador sin conexión, con datos simulados, en escritorio (1366px) y
    móvil (390px): lista, paso 1, paso 2 y detalle con el panel de acciones. Sin
    errores de JS.
  - **No probado contra Firebase real.**
- Mockups de las fases A–D para aprobación: canvas de Claude Design "ASIGNA —
  Propuesta referencia OF" (https://claude.ai/artifact/RhFvzCZ7ffCTAdfonWf4DX), con el
  design system ASIGNA. 8 artboards: nuevo ticket (paso 1, paso 2, móvil), lista de
  tickets, detalle En espera, vista SLA, catálogo de espacios y nuevo espacio. Las
  fuentes `.dc.html` están en `design/source/propuesta-referencia-of/`.

Pendiente:
- Que Jose apruebe o ajuste los mockups antes de implementar.
- Que pruebe la rama de integración contra Firebase.
- Que decida cuándo subirla.

## 2026-09-16 — Fix: tickets que se pierden en silencio (notificación sí, ticket no) — código listo, sin desplegar

Diagnóstico y reporte de Jose: la campanita mostraba "nuevo ticket" para tickets
que luego no aparecían en la sección Tickets. Se reprodujo en vivo contra
producción (navegador logueado como admin `josema@oficinasfelices.com`): el
Dashboard mostraba **1 solo ticket real** en Firestore a pesar de varias
notificaciones "nuevo_ticket" recientes (caso concreto: Isabel Morillo,
`isabelmorillo2@gmail.com`, 2 tickets — `fbGetOne('tickets', id)` confirmó que
ninguno de los dos existe en la base, no es un problema de permisos ni de
filtros de la vista).

**Causa raíz confirmada:** race condition en `getIdToken()` — ver el detalle
completo en `05-ESTANDARES.md` ("Lecciones aprendidas"). En resumen: crear un
ticket dispara 3 escrituras casi simultáneas (2 notificaciones + el ticket);
si el token de sesión vencía justo en ese momento, las 3 llamadas competían
por refrescarlo, y la rotación del refresh token en Firebase hacía que el
"perdedor" de la carrera borrara la sesión que el "ganador" acababa de
guardar bien — perdiendo 1 o 2 de las 3 escrituras sin ningún aviso (solo
`console.warn`).

**Fix implementado** (rama `fix/token-refresh-race-y-fallos-silenciosos`,
sin merge a `main` todavía):
- `ensureTokenRefreshed()` — candado (`_refreshInFlight`) para que llamadas
  concurrentes comparta un único refresh en vez de disparar varios en paralelo.
- `fbSetWithRetry()` — reintenta una vez (forzando refresh) antes de rendirse;
  usado ahora para crear tickets y notificaciones.
- Si aun así falla: el ticket queda marcado `_sync_pendiente` en vez de
  perderse — se reintenta solo en cada sync (`retrySyncPendingTickets()`, se
  llama al entrar a la app y en cada `syncFromFirebase`), y se le avisa a quien
  lo creó con un toast en vez de fallar en silencio.
- `syncFromFirebase()`/`enterApp()` ya no pisan un ticket local pendiente con
  la lista del servidor si el servidor todavía no lo tiene.
- `objToFbFields()` excluye la bandera `_sync_pendiente` para que nunca se
  guarde dentro del documento de Firestore.

**Pendiente:**
- Verificado: sintaxis del script sin errores (`node --check`) — **falta que
  Jose pruebe el flujo real** (crear tickets, forzar expiración de sesión) y
  decida cuándo hacer merge/push a `main` (proyecto compartido, solo por su
  instrucción).
- **Sin resolver, aparte:** la cuenta `usuarios/isabelmorillo2@gmail.com` que
  reportó esos 2 tickets ya no existe en la colección `usuarios` (0 locatarios
  en el sistema al momento de revisar, solo 6 cuentas de staff). No se sabe
  todavía si se borró a propósito, quedó huérfana de un registro fallido, o es
  otra cosa — pendiente de que Jose confirme antes de tocar nada ahí.
- Dado que Jose pidió explícitamente "mejor nivel de autenticación y
  seguridad": lo de arriba corrige el bug puntual, pero las reglas de
  Firestore en sí (README.md §3.1) ya usan Firebase Authentication real y
  seguridad por fila — no se identificó ninguna brecha de seguridad adicional
  en esta revisión, solo el bug de confiabilidad del token. Si Jose quiere
  ir más allá (ej. expirar sesiones más agresivamente, 2FA, límites de
  intentos de login), es una conversación aparte.

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

## 2026-09-07 — Fase 6 confirmada por Jose y fusionada a main
Dashboard ampliado probado en producción por Jose. Fusionado `plan/dashboard-ampliado` → `main`. Con esto se completa el plan de 6 fases de `06-BRIEF-Y-PROMPT-REVISION-2026-09.md`. Próximo: rediseño visual con Claude Design.

## 2026-09-07 — Locaciones y SLA editables desde Configuración
Antes eran valores fijos en el código (`LOCACIONES`, `SLA_DIAS`). Ahora Admin
los edita desde Configuración: Locaciones pasa a ser una colección Firestore
(`locaciones`, un doc por código, con seed automático de los 4 valores
originales D1-D4 si la colección está vacía) y SLA pasa a un doc único
(`configuracion/sla`). Requiere pegar las reglas nuevas de README.md §3.4 —
mientras tanto la app sigue funcionando con los valores locales/por defecto,
pero no persiste los cambios que se guarden ahí. Código listo, sin probar por
Jose todavía.

## 2026-09-07 — Rediseño visual y mejoras de Tickets/Empresas subidas a main
Fusionado `diseno/refinado-visual-direccion-a` → `main` (commit `32f09ac`):
pulido visual Dirección A (tarjetas, botones, dashboard), reordenamiento de
columnas en la tabla de Tickets (Empresa/Locación junto al código, "Asignado
a" en vez de "Locatario"), campo de correo + importación CSV en Empresas,
Locaciones y SLA editables desde Configuración, y fix del bug donde el
Dashboard quedaba visible detrás de otras vistas en escritorio. El cambio de
logo se intentó y se revirtió a pedido de Jose (no le gustó el resultado).
En producción vía GitHub Pages.

## 2026-09-07 — Logo clicable vuelve al inicio + ajuste de alineación topbar
Fusionado `feat/logo-va-al-dashboard` → `main` (commit `bd284b0`): el logo/marca
(sidebar en escritorio, header en móvil) ahora es un botón que llama a
`goHome()`, regresando a Tickets (locatario) o Dashboard (staff) — Dashboard
pasa a ser la página de inicio para staff. Se corrigió también el desalineado
visual entre el logo y el título de sección en el topbar de escritorio
(`margin-top` ajustado y verificado con captura/medición real vía Playwright).
Verificado en viewport móvil (375×700) que el nuevo botón envolvente no rompe
el header. En producción vía GitHub Pages.
