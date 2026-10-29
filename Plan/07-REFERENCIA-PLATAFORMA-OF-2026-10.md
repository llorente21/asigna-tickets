# Referencia: plataforma admin de Oficinas Felices → mejoras para ASIGNA (2026-10)

**Estado (2026-10-29):**
- **Fases A, C y D: implementadas** en ramas locales, sin push. Falta que Jose las pruebe
  contra Firebase.
- **Fase B (catálogo de espacios): cancelada.**
- **Fase E (Dashboard): propuesta en mockup**, esperando aprobación.

Mockups: canvas de Claude Design "ASIGNA — Propuesta referencia OF"
(https://claude.ai/artifact/RhFvzCZ7ffCTAdfonWf4DX), con el design system ASIGNA. Las
fuentes `.dc.html` están en `design/source/propuesta-referencia-of/` (copia del
2026-10-29; si alguien edita el canvas después, la versión vigente es la del canvas).

## Fuente

Grabación de pantalla `ASIGNA - Grabacion.mp4` (2:36 min, sin narración), compartida
por Jose el 2026-10-29. Muestra la plataforma admin de Oficinas Felices, que está en
demo en `demo.admin.dixdigitalagency.com`. Se ven seis módulos:

- **Operación:** Tickets, SLA, Reservas, Bloqueos.
- **Inmuebles:** Edificios, Oficinas y espacios.
- **Clientes:** Clientes e inquilinos, Contratos.
- **Comercial** y **Servicios:** solo el ícono; no se abrieron.
- **Administración:** Usuarios.

## Decisiones de Jose

**Ronda 1 (2026-10-29, antes de los mockups)**
- **Alcance:** tickets + espacios. El catálogo de espacios se descartó después, en la
  ronda 2.
- **Base de trabajo:** primero se fusionaron `review/todo-junto` y
  `review/diseno-junto` en la rama `integracion/referencia-of`.
- **Estados:** los 3 de siempre + "En espera" con motivo, que pausa el SLA.
- **Extras:** sin preferencia.

**Ronda 2 (2026-10-29, revisión de los mockups)**
1. **Mockups aprobados**, salvo que la vista SLA no lleva las tarjetas de indicadores.
2. **Dashboard:** Jose pidió una propuesta. Es el mockup E (ver abajo) y está pendiente
   de aprobación.
3. **iUKEN Business Center:**
   - En producción ya existía con el código **IUK**, y Jose eligió conservarlo.
   - Se agregó a las locaciones por defecto del código, solo para instalaciones nuevas.
4. **Sin catálogo de espacios:** ASIGNA es solo para tickets/incidentes.
   - La ubicación exacta se escribe en texto libre.
   - **Sin "responsable por edificio":** el responsable interno se elige a mano, como
     antes.

## Implementado

Cada fase quedó en su propia rama, en cadena:
`integracion/referencia-of` → `feat/en-espera` → `feat/form-donde-que` →
`feat/lista-vence-sla`. Así cada rama incluye las anteriores y para probar todo basta
la última.

### Fase A — "En espera" con motivo y pausa del SLA (`feat/en-espera`)

**Estados y datos**
- `STATUS_FLOW = ['nuevo','en_proceso','en_espera','cerrado']`.
- Campos nuevos del ticket:
  - `espera_motivo`: `cliente` | `proveedor` | `aprobacion`.
  - `espera_desde`: fecha ISO.
  - `sla_pausado_ms`: tiempo acumulado de las esperas ya terminadas.

**Reglas del SLA**
- Al entrar en espera se marca `espera_desde`.
- Al salir, `cerrarTramoEspera()` suma el tramo a `sla_pausado_ms`.
- `isVencidoResolucion()` y `slaLimiteResolucion()` descuentan `msEnEspera()`.
- El SLA de primera respuesta no cambia: poner un ticket en espera ya cuenta como
  respuesta de staff.
- La resolución ahora se mide en milisegundos exactos. Antes se redondeaba a días
  enteros.

**Comportamiento**
- El motivo es obligatorio. En el panel de acciones se elige con chips, junto a la nota,
  que ya era obligatoria.
- Con motivo **cliente**, el locatario recibe "Necesitamos tu respuesta".
  - Cuando comenta, el ticket vuelve solo a En proceso.
  - Staff recibe entonces "El cliente respondió".
- El detalle muestra el bloque **"Reloj del SLA"**: plazo usado, fecha límite, estado
  de la primera respuesta y tiempo en espera.
- El historial muestra el motivo de cada espera.
- El CSV suma las columnas `Esperando` y `Horas_en_espera`.

**Firestore:** sin reglas nuevas. Si en el futuro se restringe con `affectedKeys()` lo
que puede editar el locatario, hay que permitirle `status`, `espera_*`,
`sla_pausado_ms`, `historial`, `comentarios` y `fecha_actualizacion`, o se rompe el
"cliente respondió".

### Fase C — Formulario "¿Dónde y qué?" → "Detalles" (`feat/form-donde-que`)

**Paso 1**
- **Staff** elige:
  - **Reportado por:** "Yo" o un locatario.
  - **Edificio**.
- **Locatario:** ve su empresa y su edificio fijos, porque vienen de su cuenta.
- **Tipo de incidencia** en tarjetas: *Oficina de un inquilino* / *Área común*. El
  banner cambia según el tipo.
- **Categoría** e **incidente**.

**Paso 2**
- Resumen en chips de lo elegido en el paso 1.
- **Empresa afectada:** solo para staff y solo si es oficina.
- **Área o ubicación** en texto libre. Es obligatoria en áreas comunes.
- **Título** prellenado con la categoría.
- **Descripción**, **prioridad** y **fecha**.
- Vista previa del SLA según la prioridad.

**Datos y reglas**
- Campos nuevos del ticket:
  - `titulo`.
  - `tipo_incidencia`: `inquilino` | `area_comun`.
  - `ubicacion_detalle`.
- Tickets viejos: se tratan como `inquilino`, y en lugar del título se muestra la
  categoría (`tituloTicket()`).
- Un área común no lleva empresa.
- Staff ya puede reportar a su propio nombre. En ese caso no se envía notificación de
  confirmación y ya no hace falta que exista algún locatario.
- Tarjetas, detalle, búsqueda y CSV usan título, tipo y ubicación.

**Firestore:** sin reglas nuevas.

### Fase D — Lista con "Vence" + vista SLA (`feat/lista-vence-sla`)

**Lista de tickets (staff)**
- Pestañas por estado con conteo.
- Filtro "Solo en riesgo o vencidos".
- Columnas de la tabla:
  - **Ticket:** número y título.
  - **Ubicación**.
  - **Prioridad**.
  - **Estado:** incluye el motivo de la espera.
  - **Asignación:** responsable / proveedor.
  - **Vence:** el próximo plazo (`slaEstado()`).
  - **Acciones:** ver y cambiar estado.
- Las tarjetas muestran el chip "En riesgo".

**Vista SLA (staff, menú lateral y navegación móvil)**
- Elige plazo (primera respuesta o resolución) y edificio.
- Muestra dos listas: Vencidos y En riesgo.
- **No lleva tarjetas de indicadores.**
- El menú lateral tiene un contador con los tickets vencidos o en riesgo.

**Umbral de "en riesgo"**
- 4 h para la primera respuesta y 24 h para la resolución.
- Es fijo (`SLA_RIESGO_MS`); todavía no se edita desde Configuración.

## Fase E — Dashboard (propuesta, sin implementar)

Mockup "E · Dashboard (propuesta)" en el canvas. Cambios respecto al Dashboard actual:

- **Filtros:** período (este mes / 3 meses / este año / todo) y edificio. Hoy todo es
  histórico.
- **"Ahora mismo":** fila que no depende del período.
  - Abiertos, desglosados por estado.
  - Vencidos y en riesgo, con enlace a la vista SLA.
  - En espera, con su motivo.
  - Son los indicadores que salieron de la vista SLA.
- **Cumplimiento del SLA del período:**
  - Primera respuesta y resolución, en % y cantidades.
  - Promedios: primera respuesta (ahora con un dato real, `fecha_primera_respuesta`) y
    solución sin contar el tiempo en espera.
  - Reapertura y calificación.
- **Tabla por edificio:** abiertos, vencidos, en espera y % de SLA de resolución.
- **Dona de abiertos por estado** (incluye En espera) y la proporción oficinas / áreas
  comunes.
- **Creados frente a cerrados** de los últimos 6 meses, y la categoría con el promedio
  de días de solución.
- **Carga por responsable:** muestra "Sin responsable". Los proveedores externos van
  aparte.

## Patrones de UI adoptados
- **Campos:** los obligatorios llevan `*`; debajo va un texto de ayuda con un ejemplo
  concreto.
- **Valores por defecto:** el formulario llega prellenado con lo que ya se sabe
  (edificio del locatario, ahora, prioridad Media, título desde la categoría).
- **Secciones numeradas** (01–04) con título y una línea de descripción.
- **Banner que cambia** según lo elegido.
- **Teléfono:** una sola columna.
- **Estados vacíos** que dicen qué pasa.

## Qué NO se copia de la plataforma
- **Errores técnicos crudos** ("resource not found (solicitud …)").
- **Botón "Filtrar"**: ASIGNA filtra al instante.
- **KPIs que dependen de la paginación.**
- **Valores sin traducir** como "OTHER", o listas con scroll horizontal.
- **Permisos como texto separado por comas.**
- **Formularios de cliente** con ~18 campos legales obligatorios.
- **Catálogos de inmuebles, contratos o reservas**: fuera del alcance de ASIGNA.

## En el roadmap, sin compromiso
- Prioridad "Crítica" (4 niveles).
- Rol "Admin cliente".
- Invitar usuario por correo.
- Número de ticket secuencial `OF-2026-000012`.
- Umbral de "en riesgo" editable en Configuración.

## Observación de seguridad (anotada)
- **Edición del ticket por el Locatario:** la regla `allow update` de `tickets` deja
  que el Locatario dueño edite **cualquier campo** de su ticket. Conviene restringirla
  con `affectedKeys().hasOnly([...])` la próxima vez que se toquen las reglas. Hay que
  tener en cuenta los campos que necesitan la calificación, la reapertura y "cliente
  respondió".
